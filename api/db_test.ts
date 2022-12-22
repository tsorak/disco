import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import { type RowObject } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
import { initDB, dropDB, dbQuery } from "./db.ts";

Deno.test("Tables setup", async () => {
  const result: RowObject[] = await dbQuery()
    .table("sqlite_master")
    .read({ column: "name", where: { type: "table" } });

  type TableObj = { name: string };

  const tables: TableObj[] = result.map((el: RowObject): { name: string } => {
    const tableName: string = typeof el.name === "string" ? el.name : "";
    return { name: tableName };
  });

  console.log(tables);

  assertEquals(
    tables.every((el: { name: string }) => ["channelCollection", "users", "channels", "messages"].includes(el.name)),
    true
  );
});
