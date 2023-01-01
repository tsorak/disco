import { isAuthorised } from "./authorisation.ts";
import { ChannelRow, dbQuery, MessageRow, UserRow } from "./db.ts";
import { db } from "./server.ts";

const connectedSockets: Map<string, WebSocket> = new Map();

//TODO: sender: User, targets: channel.subscribers
function broadcastMessage(
  options: {
    uuid: string;
    sender: string;
    reciever: string;
    content: string;
    targets: WebSocket[];
  },
) {
  const { uuid, sender, reciever, content, targets } = options;

  if (!targets) return;

  targets.forEach((target) =>
    target.send(
      JSON.stringify({
        type: "chat",
        data: { uuid, sender, reciever, content },
      }),
    )
  );
}

export function handleUpgrade(req: Request): Response {
  //   const token: string | null =
  //     req.headers
  //       .get("cookie")
  //       ?.replace(" ", "")
  //       .split(";")
  //       .find((cookie) => {
  //         const [k, _v] = cookie.split("=");
  //         return k === "discoToken";
  //       })
  //       ?.split("=")[1] ?? "";

  //   if (!token) return new Response("No token", { status: 401 });

  //   if (!isAuthorised(token)) return new Response(null, { status: 401 });

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() != "websocket") {
    return new Response(null, { status: 405 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.onopen = (e) => {
    //TODO: If no auth message is recieved from socket in x amount of seconds, kill it.
    // console.log(e);
    socket.id = crypto.randomUUID(); //TODO: add to users active sessions?
    connectedSockets.set(socket.id, socket);
    console.log(`Socket Opened %c${socket.id}`, "color:#0f0");
    console.log(socket);
  };
  socket.onmessage = async (e: MessageEvent) => {
    try {
      // Parse the incoming message
      let incomingMessage = JSON.parse(e.data);

      if (incomingMessage.type !== "ping") {
        console.log(`[RECIEVED]`, incomingMessage);
      }

      switch (incomingMessage.type) {
        case "connect":
          {
            if (!incomingMessage.data.token) {
              socket.close(1000, "Invalid token");
              return;
            }
            const tokenPayload = await isAuthorised(incomingMessage.data.token);

            if (!tokenPayload) {
              socket.close(1000, "Invalid token");
              return;
            }

            socket.owner = tokenPayload.uuid;

            //TODO: v MAKE FUNCTION
            const currentSessionSockets = dbQuery(db).table("users").read({
              column: "sessionSockets",
              where: { uuid: tokenPayload.uuid as string },
            })[0].sessionSockets as string;

            let parsed;
            try {
              parsed = JSON.parse(currentSessionSockets);
            } catch (_error) {
              parsed = [];
            }

            const updatedSessionSockets: string[] = [...parsed, socket.id];

            dbQuery(db).table("users").update({
              sessionSockets: JSON.stringify(updatedSessionSockets),
            }, {
              where: { uuid: tokenPayload.uuid as string },
            });
            //TODO: ^ MAKE FUNCTION

            socket.send(
              JSON.stringify({ type: "connect", data: "Authorised" }),
            );
          }
          break;
        case "ping":
          socket.send(
            JSON.stringify({
              type: "pong",
              data: {
                id: incomingMessage.data.id,
                time: Date.now(),
              },
            }),
          );
          break;
        case "chat":
          {
            // { msg, target: "@me/åtister", sender: loggedInUser.uuid, token: cookie().discoToken }
            const tokenPayload = await isAuthorised(incomingMessage.data.token);

            if (!tokenPayload) {
              socket.close(1000, "Invalid token");
              return;
            }

            const channelID = incomingMessage.data.target.split("/")[1];

            const targetChannel = (dbQuery(db).table("channels").read({
              where: { uuid: channelID },
            })[0] as unknown) as ChannelRow;

            const channelSubscribers = JSON.parse(
              targetChannel.subscribers,
            ) as string[];

            const targetUsers = (dbQuery(db).table("users").read({
              where: { uuid: channelSubscribers },
              column: "sessionSockets",
            }) as unknown) as { sessionSockets: string }[];

            const targetUsersSockets = targetUsers.map((sockets) => {
              const { sessionSockets } = sockets;

              let parsed;
              try {
                parsed = JSON.parse(sessionSockets);
              } catch (error) {
                parsed = [];
              }

              return parsed;
            }).flat() as string[];

            const targets: WebSocket[] = targetUsersSockets.map((socketID) => {
              return connectedSockets.get(socketID)!;
            });

            //TODO: broadcast to sockets subscribed to the target.

            const messageRow: MessageRow = {
              uuid: crypto.randomUUID(),
              sender: tokenPayload.uuid as string,
              reciever: channelID as string,
              content: incomingMessage.data.msg as string,
            };

            broadcastMessage({ ...messageRow, targets });

            dbQuery(db).table("messages").create(messageRow);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      // Report any exceptions directly back to the client. As with our handleErrors() this
      // probably isn't what you'd want to do in production, but it's convenient when testing.
      if (socket.readyState !== 1) return;
      socket.send(JSON.stringify({ error: err.stack }));
    }
  };
  socket.onerror = (e) => console.log("socket errored:", e);
  socket.onclose = () => {
    console.log(
      `Socket Closed %c${socket.id} OWNER ${socket.owner}`,
      "color:#f00",
    );

    connectedSockets.delete(socket.id);

    if (!socket.owner) return;

    //TODO: v MAKE FUNCTION
    const currentSessionSockets = dbQuery(db).table("users").read({
      column: "sessionSockets",
      where: { uuid: socket.owner as string },
    })[0].sessionSockets as string;

    let parsed;
    try {
      parsed = JSON.parse(currentSessionSockets);
    } catch (_error) {
      parsed = [];
    }

    const updatedSessionSockets: string[] = parsed.filter((id: string) => {
      return id !== socket.id;
    });

    dbQuery(db).table("users").update({
      sessionSockets: JSON.stringify(updatedSessionSockets),
    }, {
      where: { uuid: socket.owner as string },
    });
    //TODO: ^ MAKE FUNCTION
  };
  return response;
}
