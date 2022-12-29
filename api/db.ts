import { DB } from "https://deno.land/x/sqlite/mod.ts";
interface DiscoRow {
  uuid: string;
}
interface UserRow extends DiscoRow {
  name: string;
  password: string;
  subscriptions: string;
  token: string;
}
interface ChannelRow extends DiscoRow {
  name: string;
  subscribers: string;
}
interface MessageRow extends DiscoRow {
  fromUser: string;
  relatedChannel: string;
  content: string;
  // FOREIGN KEY (fromUser) REFERENCES users(uuid)
  // FOREIGN KEY (relatedChannel) REFERENCES channels(uuid)
}
interface DirectMessageRow extends DiscoRow {
  sender: string;
  reciever: string;
  content: string;
  // FOREIGN KEY (fromUser) REFERENCES users(uuid)
  // FOREIGN KEY (relatedChannel) REFERENCES channels(uuid)
}

// let db: DB;

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

const sqlErrorCatcher = (
  fn: Function,
  returnError = false,
): boolean | Error => {
  try {
    fn();
    return true;
  } catch (err) {
    console.log(`%c${err.message}`, "color:#f00");
    console.log(err);
    return returnError ? err : false;
  }
};

const dbQuery = (db: DB) => {
  function sendQuery(query: string) {
    console.log("SENT QUERY:", query);
    return db.queryEntries(query);
  }

  return {
    table(name: string) {
      return {
        create: (
          data: UserRow | ChannelRow | MessageRow | DirectMessageRow,
        ) => {
          type PossibleRowTypes =
            | UserRow
            | ChannelRow
            | MessageRow
            | DirectMessageRow;

          function isUserRow(row: PossibleRowTypes): row is UserRow {
            return ["uuid", "name", "password", "subscriptions", "token"].map((
              k,
              _,
              arr,
            ) => k in row && Object.keys(row).length === arr.length).every((
              k,
            ) => k === true);
          }

          function isChannelRow(row: PossibleRowTypes): row is ChannelRow {
            return ["uuid", "name", "subscribers"].map((k, _, arr) =>
              k in row && Object.keys(row).length === arr.length
            ).every((k) => k === true);
          }

          function isMessageRow(row: PossibleRowTypes): row is MessageRow {
            return ["uuid", "fromUser", "relatedChannel", "content"]
              .map((
                k,
                _,
                arr,
              ) => k in row && Object.keys(row).length === arr.length).every((
                k,
              ) => k === true);
          }
          function isDirectMessageRow(
            row: PossibleRowTypes,
          ): row is DirectMessageRow {
            return ["uuid", "sender", "reciever", "content"]
              .map((
                k,
                _,
                arr,
              ) => k in row && Object.keys(row).length === arr.length).every((
                k,
              ) => k === true);
          }

          if (isUserRow(data) && name === "users") {
            const userRow = data as UserRow;
            return sendQuery(
              `INSERT INTO ${name} VALUES('${userRow.uuid}','${userRow.name}','${userRow.password}','${userRow.subscriptions}','${userRow.token}') RETURNING *`,
            );
          } else if (isChannelRow(data) && name === "channels") {
            const channelRow = data as ChannelRow;
            return sendQuery(
              `INSERT INTO ${name} VALUES('${channelRow.uuid}','${channelRow.name}','${channelRow.subscribers}') RETURNING *`,
            );
          } else if (isMessageRow(data) && name === "messages") {
            const messageRow = data as MessageRow;
            return sendQuery(
              `INSERT INTO ${name} VALUES('${messageRow.uuid}',(SELECT uuid FROM users WHERE uuid=${messageRow.fromUser} LIMIT 1),(SELECT uuid FROM channels WHERE uuid=${messageRow.relatedChannel} LIMIT 1),'${messageRow.content}') RETURNING *`,
            );
          } else if (isDirectMessageRow(data) && name === "direct_messages") {
            const messageRow = data as DirectMessageRow;
            return sendQuery(
              `INSERT INTO ${name} VALUES('${messageRow.uuid}',(SELECT uuid FROM users WHERE uuid=${messageRow.sender} LIMIT 1),(SELECT uuid FROM users WHERE uuid=${messageRow.reciever} LIMIT 1),'${messageRow.content}') RETURNING *`,
            );
          } else {
            return undefined;
          }
        },
        read: (
          options: {
            column?: string;
            where?: { uuid?: string } | Record<string, string>;
            limit?: number;
          },
        ) => {
          const column = options?.column || "*";

          if (!options || !options.where) {
            return sendQuery(`SELECT ${column} FROM ${name}`);
          }

          const buildConditions = (
            conditions: Record<string, string>,
          ): string => {
            return Object.entries(conditions)
              .map(([key, value], i) => {
                if (i === 0) {
                  return ` WHERE ${key}='${value}'`;
                }
                return `AND ${key}='${value}'`;
              })
              .join(" ");
          };

          return sendQuery(
            `SELECT ${column} FROM ${name}${buildConditions(options.where)}`,
          );
        },
        update: () => {},
        delete: () => {},
        // row(where: { uuid?: string } | Record<string, string>, options?: { limit?: number }) {
        //   options ? (options = options.limit ? ` LIMIT ${options.limit}` : undefined) : undefined;

        //   const firstCondition = Object.entries(where)[0];
        //   firstCondition[1] = `'${firstCondition[1]}'`;
        //   const condition = firstCondition.join("=");

        //   const query = `SELECT * FROM ${table} WHERE ${condition}${options ?? ""}`;
        //   console.log(query);

        //   return db.queryEntries(query);
        // },
      };
    },
  };
};

const dropDB = async (path: string) => {
  try {
    await Deno.remove(`${path}`);
  } catch (_error) {
    // console.error(`${error}`);
  }
};

const initDB = async (name = "database"): Promise<DB> => {
  await dropDB(`${name}.db`);
  const database = new DB(`${name}.db`);

  // db.execute(`
  //   DROP TABLE IF EXISTS messages;
  //   DROP TABLE IF EXISTS users;
  //   DROP TABLE IF EXISTS channels;
  // `);

  database.execute(`
    CREATE TABLE IF NOT EXISTS users (
      uuid TEXT PRIMARY KEY,
      name TEXT,
      password TEXT,
      subscriptions TEXT,
      token TEXT
    )
  `);

  database.execute(`
    CREATE TABLE IF NOT EXISTS channels (
      uuid TEXT PRIMARY KEY,
      name TEXT,
      subscribers TEXT
    )
  `);

  database.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      uuid TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      reciever TEXT,
      content TEXT,
      FOREIGN KEY (sender) REFERENCES users(uuid)
      FOREIGN KEY (reciever) REFERENCES channels(uuid)
    )
  `);

  database.execute(`
    CREATE TABLE IF NOT EXISTS direct_messages (
      uuid TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      reciever TEXT,
      content TEXT,
      FOREIGN KEY (sender) REFERENCES users(uuid)
      FOREIGN KEY (reciever) REFERENCES users(uuid)
    )
  `);
  //TODO: toUser FOREIGN KEY --> users.uuid

  return database;
};

const addExampleDataToDB = (db: DB) => {
  const testUserIDS: string[] = [];
  const testChannelIDS: string[] = [];

  const initTestArrays = () => {
    for (let i = 0; i < 2; i++) {
      testUserIDS.push(crypto.randomUUID());
    }
    for (let i = 0; i < 1; i++) {
      testChannelIDS.push(crypto.randomUUID());
    }
  };
  initTestArrays();

  //TODO: Rewrite using dbQuery

  db.execute(`
    INSERT INTO users VALUES(
      '${testUserIDS[0]}',
      'tsorak',
      'bestpasswordEU',
      '${JSON.stringify(testChannelIDS)}'
    );
    INSERT INTO users VALUES(
      '${testUserIDS[1]}',
      'annapanna',
      'betterestestpassword',
      '${JSON.stringify(testChannelIDS)}'
    );
    INSERT INTO users VALUES(
      '0',
      'Admin',
      'admin',
      '${JSON.stringify([])}'
    );

    INSERT INTO channels VALUES(
      '${testChannelIDS[0]}',
      'Test Channel',
      '${JSON.stringify(testUserIDS)}'
    );

    INSERT INTO messages VALUES(
      '${crypto.randomUUID()}',
      (SELECT uuid FROM users WHERE uuid='${testUserIDS[0]}' LIMIT 1),
      (SELECT uuid FROM channels WHERE uuid='${testChannelIDS[0]}' LIMIT 1),
      'Hello World!'
    );
  `);

  // console.log(`%cUSERS`, "background-color:#080");
  // console.log(db.queryEntries("SELECT * FROM users"));
  // console.log(`%cCHANNELS`, "background-color:#080");
  // console.log(
  //   db.queryEntries("SELECT * FROM channels").map((row) => {
  //     row.subscribers = JSON.parse(row.subscribers);
  //     return row;
  //   })
  // );

  // // console.log(JSON.parse(db.query(`SELECT subscribers FROM channels WHERE uuid='${testChannelIDS[0]}'`)[0][0]));
  // console.log(`%cMESSAGES`, "background-color:#080");
  // console.log(db.queryEntries("SELECT * FROM messages"));

  // dbQuery().table("users").create();

  // console.log(`%cTesting dbQuery`, "background-color:#f90");
  // console.log(
  //   dbQuery()
  //     .table("users")
  //     .read({ where: { uuid: testUserIDS[1] } })
  // );
  // console.log(
  //   dbQuery()
  //     .table("channels")
  //     .read({ where: { uuid: testChannelIDS[0] } })
  // );

  // //get all subscribers
  // console.log(`%cGet all subscribers (Through user subscriptions)`, "background-color:#05a");
  // console.log("Filter each returned row based on their subscriptions");
  // console.log(
  //   dbQuery()
  //     .table("users")
  //     .read({ column: "*" })
  //     .filter((row) => {
  //       return JSON.parse(row.subscriptions).includes(testChannelIDS[0]);
  //     })
  // );

  // console.log(`%cError create a new user`, "background-color:#a00");
  // console.log(
  //   "User created:",
  //   sqlErrorCatcher(() => dbQuery().table("users").create({ uuid: "112", name: "bajamaja", password: "secret", subscriptions: "[]", non_existant_field: "foo" }))
  // );

  // console.log(`%cCreate a new user`, "background-color:#05a");
  // console.log(
  //   "User created:",
  //   sqlErrorCatcher(() => dbQuery().table("users").create({ uuid: "112", name: "bajamaja", password: "secret", subscriptions: "[]" }))
  // );

  // console.log(`%cTry to create a user that already exists`, "background-color:#05a");
  // console.log(
  //   "User created:",
  //   sqlErrorCatcher(() => dbQuery().table("users").create({ uuid: "112", name: "bajamaja", password: "secret", subscriptions: "[]" }))
  // );

  // dbQuery().table("users").update();
  // dbQuery().table("users").delete();
};

// addExampleDataToDB();

// const user = {
//   register: (options) => {},
//   login: (options) => {},
//   exists: (uuid: string) => {},
//   subscriptions: {
//     subscribe: (uuid: string) => {},
//     unsubscribe: (uuid: string) => {},
//   },
// };
// const channel = {
//   create: ({}) => {},
//   exists: ({}) => {},
//   getType: (uuid: string) => {},
//   subscribers: {
//     add: () => {},
//     remove: () => {},
//   },
// };
// const message = {
//   add: () => {},
//   remove: () => {},
//   reaction: {
//     add: () => {},
//     remove: () => {},
//   },
// };
// // const channelCollection ???

const getChannelCollectionData = async (target: string, token: string) => {
  return ["name", "subchannels"];
};

const getChannelData = async (target: string, token: string) => {
  return ["name", "members", "messages"];
};

const rawQuery = (args: string, db: DB) => db.queryEntries(args);

export {
  dbQuery,
  dropDB,
  getChannelCollectionData,
  getChannelData,
  initDB,
  rawQuery,
};

export type { ChannelRow, DirectMessageRow, MessageRow, UserRow };
