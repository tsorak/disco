import { isAuthorized } from "./validate.ts";

async function handle(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
        await requestEvent.respondWith(handleReq(requestEvent.request));
    }
}

const connectedSockets: Map<string, WebSocket> = new Map();

//TODO: sender: User, targets: channel.subscribers
function broadcastMessage(options: { sender: { name: string | undefined } | undefined; targets: WebSocket[] | undefined; msg: string }) {
    const { msg } = options;
    const targets = options.targets ?? Array.from(connectedSockets).map(([_, v]) => v);
    const sender = options.sender ?? { name: "AnonymousUser" };

    targets.forEach((target) => target.send(JSON.stringify({ type: "chat", data: { sender, msg } })));
}

function handleReq(req: Request): Response {
    const token: string =
        req.headers
            .get("cookie")
            .replace(" ", "")
            .split(";")
            .find((cookie) => {
                const [k, _v] = cookie.split("=");
                return k === "discoToken";
            })
            ?.split("=")[1] ?? "";

    if (!token) return new Response(null, { status: 400 });

    if (!isAuthorized(token)) return new Response(null, { status: 401 });

    const upgrade = req.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() != "websocket") {
        return new Response(null, { status: 405 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    socket.onopen = () => {
        socket.id = crypto.randomUUID();
        connectedSockets.set(socket.id, socket);
        console.log(`Socket Opened %c${socket.id}`, "color:#0f0");
    };
    socket.onmessage = (e) => {
        try {
            // Parse the incoming message
            let incomingMessage = JSON.parse(e.data);

            if (incomingMessage.type !== "ping") console.log(`[RECIEVED]`, incomingMessage);

            switch (incomingMessage.type) {
                case "ping":
                    socket.send(
                        JSON.stringify({
                            type: "pong",
                            data: {
                                id: incomingMessage.data.id,
                                time: Date.now(),
                            },
                        })
                    );
                    break;
                case "chat":
                    // { msg, target: "@me/åtister", sender: loggedInUser.uuid, token: cookie().discoToken }
                    if (!isAuthorized(incomingMessage.data.token)) throw new Error("401");

                    const msg: string = incomingMessage.data.msg.toString();
                    // const targets: WebSocket[] = getChannelSubscribers(incomingMessage.data.target);

                    //TODO: broadcast to sockets subscribed to the target.
                    broadcastMessage({ msg });
                    break;
                default:
                    break;
            }
        } catch (err) {
            // Report any exceptions directly back to the client. As with our handleErrors() this
            // probably isn't what you'd want to do in production, but it's convenient when testing.
            socket.send(JSON.stringify({ error: err.stack }));
        }
    };
    socket.onerror = (e) => console.log("socket errored:", e);
    socket.onclose = () => {
        connectedSockets.delete(socket.id);
        console.log(`Socket Closed %c${socket.id}`, "color:#f00");
    };
    return response;
}

const server = Deno.listen({ port: 8080 });

for await (const conn of server) {
    handle(conn);
}
