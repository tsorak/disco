import { db } from "./server.ts";
import {
  ChannelRow,
  dbQuery,
  getUsersByUUIDs,
  MessageRow,
  UserRow,
} from "./db.ts";
import { create, isAuthorised } from "./authorisation.ts";
import { Cookie } from "https://deno.land/x/another_cookiejar@v5.0.1/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

function readChannel(channelID: string, requester: UserRow["uuid"]) {
  if (!channelID) return;

  const requestedChannel = (dbQuery(db).table("channels").read({
    where: { uuid: channelID },
  })[0] as unknown) as ChannelRow;

  if (!requestedChannel) return;

  const requestedChannelSubscribers = JSON.parse(
    requestedChannel.subscribers,
  ) as string[];

  if (!requestedChannelSubscribers.includes(requester)) {
    //user is not part of the channels subscribers
    console.log("User is not apart of the channels subscribers.");
    return;
  } else {
    const channelMessages = (dbQuery(db).table("messages").read({
      where: { reciever: requestedChannel.uuid },
    }) as unknown[]) as MessageRow[];

    const channelUsers = getUsersByUUIDs(
      requestedChannelSubscribers,
      db,
    );

    const members = channelUsers.map((user) => {
      return { uuid: user.uuid, name: user.name };
    });

    const channel = {
      name: requestedChannel.name,
      messages: channelMessages,
      members,
    };
    return channel;
  }
}
function readChannelCollection(
  collectionID: string,
  requester: UserRow["uuid"],
) {
  if (!collectionID) return;

  type ChannelData = { name: string; avatar: string; path: string };

  const user = (dbQuery(db).table("users").read({
    column: "subscriptions",
    where: { uuid: requester },
  })[0] as unknown) as { subscriptions: string } | undefined;

  if (!user) return;

  const subscriptions = JSON.parse(
    user.subscriptions,
  ) as ChannelRow["uuid"][];

  const requestersChannels: ChannelRow[] = [];

  subscriptions.forEach((channelUUID: ChannelRow["uuid"]) => {
    const channelRow = (dbQuery(db).table("channels").read({
      where: {
        parent: collectionID === "@me" ? null : collectionID,
        uuid: channelUUID,
      },
    })[0] as unknown) as ChannelRow | undefined;

    if (channelRow) requestersChannels.push(channelRow);
  });

  const simplifiedChannels: ChannelData[] = requestersChannels.map(
    (channelRow) => {
      return {
        name: channelRow.name,
        avatar: "",
        path: `${collectionID}/${channelRow.uuid}`,
      } as ChannelData;
    },
  );

  const channelCollection: ChannelData[] | undefined = simplifiedChannels;
  return channelCollection;
}
function readUserData(
  userID: string,
): { uuid: string; name: string; email: string } {
  const { uuid, name, email } = dbQuery(db).table("users").read({
    where: { uuid: userID },
  })[0] as unknown as UserRow;

  return { uuid, name, email };
}

const appHandler = async (req: Request) => {
  const channelPath = new URL(req.url).pathname.split("/")
    .slice(2, 4);

  const tokenPayload = await isAuthorised(req);
  if (!tokenPayload) return new Response(null, { status: 403 });

  const { uuid } = tokenPayload;
  if (!uuid || typeof uuid !== "string") {
    return new Response(null, { status: 500 });
  }

  switch (req.method) {
    case "GET": {
      const channelCollection = readChannelCollection(channelPath[0], uuid);
      const channel = readChannel(channelPath[1], uuid);
      const userData = readUserData(uuid);

      return new Response(
        JSON.stringify({
          requestedPaths: channelPath,
          channelCollection,
          channel,
          userData,
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
  const createTokenCookie = async (payload: { userID: string }) => {
    const userID = payload.userID;

    const cookie = Cookie.from(
      `discoToken=${await create({ uuid: userID })};`,
    );
    cookie.expires = Date.now() + 1000 * 60 * 60 * 2;
    cookie.path = "/";

    return cookie;
  };

  switch (req.method) {
    case "GET": {
      const payload = await isAuthorised(req);
      if (payload) {
        return new Response("Authorized", { status: 200 });
      } else {
        return new Response("Not authorized", { status: 403 });
      }
    }
    // case "POST": {
    //   const cookie = Cookie.from(
    //     `discoToken=${await create({ uuid: "1" })};`,
    //   );

    //   cookie.expires = Date.now() + 1000 * 60 * 60 * 2;
    //   cookie.path = "/";
    //   console.log(cookie.toString());

    //   const headers = new Headers();
    //   headers.set("Set-Cookie", cookie.toString());
    //   headers.set("Access-Control-Allow-Origin", "*");

    //   return new Response("Token set", {
    //     status: 200,
    //     headers,
    //   });
    // }
    case "POST": {
      let payload;
      try {
        payload = await req.json();
      } catch (error) {
        return new Response(null, { status: 400 });
      }
      const { email, password } = payload;
      if (!email || !password) return new Response(null, { status: 400 });

      // bcrypt
      const hashedPassword = await bcrypt.hash(password);
      let queryRes;
      try {
        queryRes = dbQuery(db).table("users").create(
          {
            uuid: crypto.randomUUID(),
            email,
            name: "DiscoUser",
            password: hashedPassword,
            sessionSockets: JSON.stringify([]),
            subscriptions: JSON.stringify(["0"]),
            token: "",
          } as UserRow,
        )![0] as unknown as UserRow;
      } catch (error) {
        return new Response(null, { status: 400 });
      }
      console.log("User created:", queryRes);

      // TODO: function userSubscribeTo(channelID: string)
      const supportChannelSubscribers = dbQuery(db).table("channels").read({
        where: { uuid: "0" },
        column: "subscribers",
      })[0] as unknown as { subscribers: ChannelRow["subscribers"] };

      const parsed = JSON.parse(
        supportChannelSubscribers.subscribers,
      ) as string[];
      parsed.push(queryRes.uuid);

      dbQuery(db).table("channels").update({
        subscribers: JSON.stringify(parsed),
      }, { where: { uuid: "0" } });
      // TODO: ^

      const cookie = await createTokenCookie({ userID: queryRes.uuid });

      const body = {
        uuid: queryRes.uuid,
        name: queryRes.name,
        email: queryRes.email,
      };

      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "set-cookie": cookie.toString() },
      });
    }
    case "PUT": {
      let payload;
      try {
        payload = await req.json();
      } catch (error) {
        return new Response(null, { status: 400 });
      }
      const { email, password } = payload;
      if (!email || !password) return new Response(null, { status: 400 });

      // bcrypt
      let queryRes;
      try {
        queryRes = dbQuery(db).table("users").read({
          where: { email },
        })[0] as unknown as UserRow;
      } catch (error) {
        return new Response(null, { status: 400 });
      }
      if (!queryRes) return new Response(null, { status: 400 });
      console.log("User found:", queryRes);

      const correctPassword = bcrypt.compareSync(password, queryRes.password);

      if (!correctPassword) return new Response(null, { status: 400 });

      const cookie = await createTokenCookie({ userID: queryRes.uuid });

      return new Response(null, {
        status: 200,
        headers: { "set-cookie": cookie.toString() },
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
