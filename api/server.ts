import { handleUpgrade } from "./socket.ts";
import { handleRequest } from "./router.ts";
import { dbQuery, initDB } from "./db.ts";

const db = await initDB();

dbQuery(db).table("users").create({
  uuid: "1",
  name: "Mr Fool",
  password: "3",
  subscriptions: "[]",
  token: "123",
});
dbQuery(db).table("users").create({
  uuid: "2",
  name: "Mr Barr",
  password: "3",
  subscriptions: "[]",
  token: "123",
});
dbQuery(db).table("direct_messages").create({
  uuid: "0",
  sender: "2",
  reciever: "1",
  content: "4",
});

async function handle(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    console.log(
      `[%c${
        requestEvent.request.headers.get("upgrade")?.toUpperCase() ??
          requestEvent.request.method
      }%c] ${new URL(requestEvent.request.url).pathname}`,
      "color:#0f0;",
      "color:initial;",
    );
    const wantsUpgrade = (requestEvent: Deno.RequestEvent): boolean =>
      requestEvent.request.headers.has("upgrade");

    if (wantsUpgrade(requestEvent)) {
      await requestEvent.respondWith(handleUpgrade(requestEvent.request));
    } else {
      await requestEvent.respondWith(handleRequest(requestEvent.request));
    }
  }
}

const server = Deno.listen({ port: 8080 });

for await (const conn of server) {
  handle(conn);
}

export { db };
