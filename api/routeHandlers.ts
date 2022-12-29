import { db } from "./server.ts";
import { dbQuery, UserRow } from "./db.ts";
import type { DirectMessageRow } from "./db.ts";
import { create, isAuthorized } from "./authorization.ts";
import { Cookie } from "https://deno.land/x/another_cookiejar@v5.0.1/mod.ts";

const appHandler = async (req: Request) => {
  const channelPath = new URL(req.url).pathname.split("/")
    .slice(2, 4);

  const tokenPayload = await isAuthorized(req);
  if (!tokenPayload) return new Response(null, { status: 403 });

  const { uuid } = tokenPayload;
  if (!uuid || typeof uuid !== "string") {
    return new Response(null, { status: 500 });
  }

  let channelCollection, channel;

  switch (req.method) {
    case "GET": {
      if (channelPath[0] === "@me") {
        const dms = dbQuery(db).table("direct_messages").read({
          where: { reciever: uuid },
        });

        channelCollection = dms.map((row) => {
          const directMessageRow = (row as unknown) as DirectMessageRow;
          const senderUUID = directMessageRow.sender;
          const sender = (dbQuery(db).table("users").read({
            where: { uuid: senderUUID },
            limit: 1,
          })[0] as unknown) as UserRow;

          return { name: sender.name, avatar: "" };
        });
      } else {
        //TODO: return subchannels for the requested DiscoServer

        // const user = dbQuery(db).table("users").read({
        //   where: { uuid },
        //   limit: 1,
        // })[0];

        // const userSubscriptions: string[] = (typeof user.subscriptions === "string" &&
        //   JSON.parse(user.subscriptions)) ?? [];
      }

      //'SELECT subscribers FROM dms || channels ? where type=dm?' filter
      //||
      //messages toUser, SELECT toUser FROM messages WHERE toUser === "@me".

      //if channelCollection is uuid then return dm channels?

      return new Response(
        JSON.stringify({
          requestedPaths: channelPath,
          channelCollection,
          channel,
        }),
        {
          status: 200,
        },
      );
    }
    // case "POST":

    default:
      return new Response(null, { status: 405 });
  }
};

const authHandler = async (req: Request) => {
  //TODO: /verify /refresh instead of req.method?

  switch (req.method) {
    case "GET": {
      const payload = await isAuthorized(req);
      if (payload) {
        return new Response("Authorized", { status: 200 });
      } else {
        return new Response("Not authorized", { status: 403 });
      }
    }
    case "POST": {
      const cookie = Cookie.from(
        `discoToken=${await create({ uuid: "1" })};`,
      );

      cookie.expires = Date.now() + 1000 * 60 * 60 * 2;
      cookie.path = "/";
      console.log(cookie.toString());

      const headers = new Headers();
      headers.set("Set-Cookie", cookie.toString());
      headers.set("Access-Control-Allow-Origin", "*");

      return new Response("Token set", {
        status: 200,
        headers,
      });
    }
    case "OPTIONS": {
      return new Response(null, { status: 200 });
    }
    default:
      return new Response("", { status: 500 });
  }
};

export { appHandler, authHandler };
