// const routes: Map<string, any> = new Map([
//   ["/", () => "nice route noob"],
//   ["/slow", async () => new Promise((res, rej) => setTimeout(() => res("Slow responding route"), 1000))],
//   ["/tooslow", async () => new Promise((res, rej) => setTimeout(() => res("You (client) should not see this"), 6000))],
// ]);
// const routeFunc = routes.get(path);
// if (routeFunc) {
//   try {
//     const body: string = await new Promise(async (res, rej) => {
//       setTimeout(() => rej(""), 5000);
//       res(JSON.stringify(await routeFunc()));
//     });
//     return new Response(body, { status: 200 });
//   } catch (e) {
//     return new Response("Server Error", { status: 500 });
//   }
// }
