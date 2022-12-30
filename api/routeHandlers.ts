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

const appHandler = async (req: Request) => {
  const channelPath = new URL(req.url).pathname.split("/")
    .slice(2, 4);

  const tokenPayload = await isAuthorised(req);
  if (!tokenPayload) return new Response(null, { status: 403 });

  const { uuid } = tokenPayload;
  if (!uuid || typeof uuid !== "string") {
    return new Response(null, { status: 500 });
  }

  let channelCollection, channel;

  switch (req.method) {
    case "GET": {
      // if (channelPath[0] === "@me") {
      //   //TODO: make this readable...
      //   const dms = (dbQuery(db).table("channels").read({
      //     where: { parent: null },
      //   }) as unknown) as ChannelRow[];
      //   const userDms = (dms.filter((row: ChannelRow) => {
      //     const parsed = JSON.parse(row.subscribers) as string[];
      //     return parsed.includes(uuid);
      //   }).map((dm) => {
      //     const subscribers = JSON.parse(dm.subscribers) as string[];
      //     const name = subscribers.filter(
      //       (subscriberUUID) => subscriberUUID !== uuid,
      //     ).map((subscriber: UserRow["uuid"]) => {
      //       const user = dbQuery(db).table("users").read({
      //         column: "name",
      //         where: { uuid: subscriber },
      //       })[0];
      //       return user.name;
      //     }).join(", ");
      //     return { name, avatar: "", path: `@me/${dm.uuid}` };
      //   }) as unknown) as { name: string; avatar: string; path: string }[];

      //   channelCollection = userDms;
      // } else if (channelPath[0] != undefined) {
      //   //TODO: return subchannels for the requested DiscoServer

      //   // const user = dbQuery(db).table("users").read({
      //   //   where: { uuid },
      //   //   limit: 1,
      //   // })[0];

      //   // const userSubscriptions: string[] = (typeof user.subscriptions === "string" &&
      //   //   JSON.parse(user.subscriptions)) ?? [];
      // }

      channelCollection = readChannelCollection(channelPath[0], uuid);
      channel = readChannel(channelPath[1], uuid);

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
      const payload = await isAuthorised(req);
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
