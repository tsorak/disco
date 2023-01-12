//index.tsx routeData

import { createServerData$ } from "solid-start/server";

export function AppData() {
  const testData = createServerData$(
    () =>
      new Promise((resolve, reject) => {
        resolve("Hello World!");
      }) as Promise<string>,
  );
  return [testData];
}
