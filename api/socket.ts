import { isAuthorized } from "./validate.ts";

async function handle(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
        await requestEvent.respondWith(handleReq(requestEvent.request));
    }
}

function handleReq(req: Request): Response {
    const cookies = new Map();
    req.headers
        .get("cookie")
        .replace(" ", "")
        .split(";")
        .forEach((cookie) => {
            const [k, v] = cookie.split("=");
            cookies.set(k, v);
        });
    console.log(cookies);

    if (!isAuthorized(cookies)) return new Response(null, { status: 401 });

    const upgrade = req.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() != "websocket") {
        return new Response(null, { status: 405 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    socket.onopen = () => console.log("socket opened");
    socket.onmessage = (e) => {
        try {
            // Parse the incoming message
            let incomingMessage = JSON.parse(e.data);
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
                    break;
                default:
                    console.log(incomingMessage);
                    break;
            }
        } catch (err) {
            // Report any exceptions directly back to the client. As with our handleErrors() this
            // probably isn't what you'd want to do in production, but it's convenient when testing.
            socket.send(JSON.stringify({ error: err.stack }));
        }
    };
    socket.onerror = (e) => console.log("socket errored:", e);
    socket.onclose = () => console.log("socket closed");
    return response;
}

const server = Deno.listen({ port: 8080 });

for await (const conn of server) {
    handle(conn);
}
