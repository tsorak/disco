import { handleUpgrade } from "./socket.ts";
import { handleRequest } from "./router.ts";
import { ChannelRow, dbQuery, initDB, MessageRow, UserRow } from "./db.ts";

const db = await initDB();
//USERS
dbQuery(db).table("users").create({
  uuid: "1",
  name: "Mr Fool",
  password: "3",
  subscriptions: JSON.stringify(["0", "1", "2"]),
  token: "123",
  sessionSockets: "[]",
} as UserRow);
dbQuery(db).table("users").create({
  uuid: "2",
  name: "Mr Barr",
  password: "3",
  subscriptions: JSON.stringify(["0", "2"]),
  token: "123",
  sessionSockets: "[]",
} as UserRow);
dbQuery(db).table("users").create({
  uuid: "3",
  name: "Mr Bazz",
  password: "3",
  subscriptions: JSON.stringify(["1", "2"]),
  token: "123",
  sessionSockets: "[]",
} as UserRow);
//CHANNELS
dbQuery(db).table("channels").create({
  uuid: "0",
  parent: null,
  name: null,
  subscribers: JSON.stringify(["1", "2"]),
} as ChannelRow);
dbQuery(db).table("channels").create({
  uuid: "1",
  parent: null,
  name: null,
  subscribers: JSON.stringify(["1", "3"]),
} as ChannelRow);
dbQuery(db).table("channels").create({
  uuid: "2",
  parent: null,
  name: null,
  subscribers: JSON.stringify(["1", "2", "3"]),
} as ChannelRow);
//MESSAGES
dbQuery(db).table("messages").create({
  uuid: "0",
  sender: "2",
  reciever: "0",
  content: "Hello Fool!",
} as MessageRow);

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
