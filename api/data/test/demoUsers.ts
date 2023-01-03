import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { ChannelRow, dbQuery, MessageRow, UserRow } from "../../db.ts";

function init(db: DB) {
  //USERS
  dbQuery(db).table("users").create({
    uuid: "1",
    email: "fool@disco.com",
    name: "Mr Fool",
    password: "3",
    subscriptions: JSON.stringify(["0", "1", "2"]),
    token: "123",
    sessionSockets: "[]",
  } as UserRow);
  dbQuery(db).table("users").create({
    uuid: "2",
    email: "barr@disco.com",
    name: "Mr Barr",
    password: "3",
    subscriptions: JSON.stringify(["0", "2"]),
    token: "123",
    sessionSockets: "[]",
  } as UserRow);
  dbQuery(db).table("users").create({
    uuid: "3",
    email: "bazz@disco.com",
    name: "Mr Bazz",
    password: "3",
    subscriptions: JSON.stringify(["1", "2"]),
    token: "123",
    sessionSockets: "[]",
  } as UserRow);
  //CHANNELS
  dbQuery(db).table("channels").create({
    uuid: "0",
    parent: null,
    name: null,
    subscribers: JSON.stringify(["1", "2"]),
  } as ChannelRow);
  dbQuery(db).table("channels").create({
    uuid: "1",
    parent: null,
    name: null,
    subscribers: JSON.stringify(["1", "3"]),
  } as ChannelRow);
  dbQuery(db).table("channels").create({
    uuid: "2",
    parent: null,
    name: null,
    subscribers: JSON.stringify(["1", "2", "3"]),
  } as ChannelRow);
  //MESSAGES
  dbQuery(db).table("messages").create({
    uuid: "0",
    sender: "2",
    reciever: "0",
    content: "Hello Fool!",
  } as MessageRow);
}

export { init };
