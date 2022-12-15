export async function handleRequest(req: Request): Promise<Response> {
  if (new URL(req.url).pathname === "/favicon.ico") return new Response(null, { status: 418 });

  const extractJson = async (req: Request) => {
    try {
      return await req.json();
    } catch (e) {
      return null;
    }
  };

  const json = await extractJson(req);

  const cookies = Object.fromEntries(
    req.headers
      .get("cookie")
      ?.replaceAll(";", "")
      .split(" ")
      .map((c) => c.split("=")) ?? []
  );

  const responseBody = {
    request: {
      url: req.url,
      method: req.method,
      body: json ?? "",
      cookies,
    },
  };
  console.dir(responseBody);

  const headers = new Map();
  headers.set("content-type", "application/json");

  return new Response(JSON.stringify(responseBody), { status: 200, headers: Object.fromEntries(headers) });
}
