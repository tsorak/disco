import { appHandler, authHandler } from "./routeHandlers.ts";

export async function handleRequest(req: Request): Promise<Response> {
  const path = new URL(req.url).pathname;
  if (path === "/favicon.ico") return new Response(null, { status: 418 });

  const [api] = path.split("/").slice(1);
  console.log("API:", api);

  if (api === "app") {
    return await appHandler(req);
  } else if (api === "auth") {
    return await authHandler(req);
  } else {
    return new Response(null, { status: 404 });
  }

  // const extractJson = async (req: Request) => {
  //   try {
  //     return await req.json();
  //   } catch (e) {
  //     return null;
  //   }
  // };

  // const json = await extractJson(req);

  // const cookies = Object.fromEntries(
  //   req.headers
  //     .get("cookie")
  //     ?.replaceAll(";", "")
  //     .split(" ")
  //     .map((c) => c.split("=")) ?? [],
  // );
  // const token = cookies.discoToken;

  // const responseData: Record<string, unknown> = {
  //   channelCollection: undefined,
  //   channel: undefined,
  //   queryResult: undefined,
  // };

  // let status = 200;

  // if (channel || channelCollection) {
  //   switch (req.method) {
  //     case "GET":
  //       responseData.channelCollection = channelCollection && !channel
  //         ? await getChannelCollectionData(channelCollection, token)
  //         : {};
  //       responseData.channel = channel
  //         ? await getChannelData(channel, token)
  //         : {};
  //       break;
  //     case "POST":
  //       {
  //         try {
  //           responseData.queryResult = rawQuery(json.query, db);
  //           status = 200;
  //         } catch (err) {
  //           responseData.queryResult = err;
  //           status = 400;
  //         }
  //       }
  //       break;

  //     default:
  //       break;
  //   }
  // }
  // const responseBody = {
  //   request: {
  //     url: req.url,
  //     method: req.method,
  //     body: json ?? "",
  //     cookies,
  //   },
  //   responseData,
  // };
  // console.dir(responseBody);

  // const headers = new Map();
  // headers.set("content-type", "application/json");

  // return new Response(JSON.stringify(responseBody), {
  //   status,
  //   headers: Object.fromEntries(headers),
  // });
}
