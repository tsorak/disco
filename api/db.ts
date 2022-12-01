import { DB } from "https://deno.land/x/sqlite/mod.ts";

// Open a database
// const db = new DB("test.db");
// db.execute(`
//   CREATE TABLE IF NOT EXISTS people (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT
//   )
// `);

// // Run a simple query
// for (const name of ["Peter Parker", "Clark Kent", "Bruce Wayne"]) {
//     db.query("INSERT INTO people (name) VALUES (?)", [name]);
// }

// // Print out data in table
// for (const [name] of db.query("SELECT name FROM people")) {
//     console.log(name);
// }

// // Close connection
// db.close();

// const users = new DB("users.db");
// const channels = new DB("channels.db");

const db = new DB("database.db");

db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT,
    name TEXT,
    password TEXT,
    subscriptions TEXT
  )
`); //subscriptions jsonb
db.execute(`
  CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT,
    name TEXT,
    type TEXT,
    subscribers TEXT
  )
`);

const user = {
  register: (options) => {},
  login: (options) => {},
  exists: (uuid: string) => {},
  subscriptions: {
    subscribe: (uuid: string) => {},
    unsubscribe: (uuid: string) => {},
  },
};

const channel = {
  create: ({}) => {},
  exists: ({}) => {},
  getType: (uuid: string) => {},
  subscribers: {
    add: () => {},
    remove: () => {},
  },
};

// const channelCollection ???

const message = {
  add: () => {},
  remove: () => {},
  reaction: {
    add: () => {},
    remove: () => {},
  },
};
