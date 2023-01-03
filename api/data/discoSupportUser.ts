import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { ChannelRow, dbQuery, MessageRow, UserRow } from "../db.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

async function init(db: DB) {
  dbQuery(db).table("users").create({
    uuid: "0",
    email: "admin@disco.com",
    name: "Disco Admin",
    password: await bcrypt.hash("disco"),
    subscriptions: JSON.stringify(["0"]),
    token: "",
    sessionSockets: JSON.stringify([]),
  } as UserRow);
  //CHANNELS
  dbQuery(db).table("channels").create({
    uuid: "0",
    parent: null,
    name: "Disco Support",
    subscribers: JSON.stringify(["0"]),
  } as ChannelRow);
  //MESSAGES
  dbQuery(db).table("messages").create({
    uuid: "0",
    sender: "0",
    reciever: "0",
    content: "Welcome to Disco!",
  } as MessageRow);
}

export { init };
