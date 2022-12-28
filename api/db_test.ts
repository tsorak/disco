import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import { type RowObject } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import { dbQuery, dropDB, initDB } from "./db.ts";

Deno.test("Tables setup", async () => {
  const db = await initDB("test");

  const result: RowObject[] = await dbQuery(db)
    .table("sqlite_master")
    .read({ column: "name", where: { type: "table" } });

  type TableObj = { name: string };

  const tables: TableObj[] = result.map((el: RowObject): { name: string } => {
    const tableName: string = typeof el.name === "string" ? el.name : "";
    return { name: tableName };
  });

  console.log(tables);

  assertEquals(
    tables.every((el: { name: string }) =>
      ["channelCollection", "users", "channels", "messages"].includes(el.name)
    ),
    true,
  );

  db.close();
  await dropDB("test.db");
});

Deno.test("Add rows", async () => {
  const db = await initDB("test");

  const userRow = await dbQuery(db).table("users").create({
    uuid: "123",
    name: "2",
    password: "3",
    subscriptions: "[]",
  });
  const channelRow = await dbQuery(db).table("channels").create({
    uuid: "456",
    name: "2",
    subscribers: "[]",
  });
  const messageRow = await dbQuery(db).table("messages").create({
    uuid: "1",
    fromUser: "123",
    relatedChannel: "456",
    content: "4",
  });
  const invalidRow = await dbQuery(db).table("users").create({
    uuid: "1",
    fromUser: "2",
    relatedChannel: "3",
    content: "4",
    name: "badKey",
  });

  console.log(userRow);
  console.log(channelRow);
  console.log(messageRow);
  console.log(invalidRow);

  const actual = [
    !!userRow,
    !!channelRow,
    !!messageRow,
    invalidRow === undefined,
  ];

  console.log(actual);

  assertEquals(
    actual.every((entry) => entry === true),
    true,
  );

  db.close();
  await dropDB("test.db");
});
