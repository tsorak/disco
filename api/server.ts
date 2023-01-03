import { handleUpgrade } from "./socket.ts";
import { handleRequest } from "./router.ts";
import { initDB } from "./db.ts";
// import * as demoUsers from "./data/test/demoUsers.ts";
import * as discoSupportUser from "./data/discoSupportUser.ts";

const db = await initDB();

discoSupportUser.init(db);
// demoUsers.init(db);

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
