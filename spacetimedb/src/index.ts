import { Timestamp } from "spacetimedb";
import { schema, table, t } from "spacetimedb/server";

const spacetimedb = schema({
  directoryCategory: table(
    { public: true },
    {
      id: t.u64().primaryKey().autoInc(),
      key: t.string().unique(),
      name: t.string(),
      count: t.number(),
      description: t.string(),
      level: t.number(),
      created: t.timestamp(),
      updated: t.timestamp(),
    },
  ),
  directoryPerson: table(
    { public: true },
    {
      id: t.u64().primaryKey().autoInc(),
      firstName: t.string(),
      lastName: t.string(),
      company: t.string(),
      title: t.string(),
      bio: t.string(),
      categoryKey: t.string(),
      categories: t.array(t.string()),
      email: t.string().unique(),
      phone: t.string().unique(),
      city: t.string(),
      state: t.string(),
      zip: t.string(),
      country: t.string(),
      website: t.string(),
      profileImage: t.string(),
      dataJson: t.string(),
      created: t.timestamp(),
      updated: t.timestamp(),
    },
  ),
  directoryPlace: table(
    { public: true },
    {
      id: t.u64().primaryKey().autoInc(),
      name: t.string(),
      categoryKey: t.string(),
      categories: t.array(t.string()),
      description: t.string(),
      address: t.string(),
      city: t.string(),
      state: t.string(),
      zip: t.string(),
      country: t.string(),
      phone: t.string(),
      email: t.string(),
      website: t.string(),
      profileImage: t.string(),
      dataJson: t.string(),
      created: t.timestamp(),
      updated: t.timestamp(),
    },
  ),
  directoryWebsite: table(
    { public: true },
    {
      id: t.u64().primaryKey().autoInc(),
      name: t.string(),
      categoryKey: t.string(),
      categories: t.array(t.string()),
      description: t.string(),
      url: t.string(),
      profileImage: t.string(),
      dataJson: t.string(),
      created: t.timestamp(),
      updated: t.timestamp(),
    },
  ),
  person: table(
    { public: true },
    {
      name: t.string(),
    },
  ),
});
export default spacetimedb;

export const init = spacetimedb.init((_ctx) => {
  // Called when the module is initially published
});

export const onConnect = spacetimedb.clientConnected((_ctx) => {
  // Called every time a new client connects
});

export const onDisconnect = spacetimedb.clientDisconnected((_ctx) => {
  // Called every time a client disconnects
});

export const add = spacetimedb.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    ctx.db.person.insert({ name });
  },
);

export const createDirectoryCategory = spacetimedb.reducer(
  {
    key: t.string(),
    name: t.string(),
    description: t.string(),
    level: t.number(),
  },
  (ctx, { key, name, description, level }) => {
    const now = Timestamp.now();

    ctx.db.directoryCategory.insert({
      id: 0n,
      key,
      name,
      count: 0,
      description,
      level,
      created: now,
      updated: now,
    });
  },
);

export const sayHello = spacetimedb.reducer((ctx) => {
  for (const person of ctx.db.person.iter()) {
    console.info(`Hello, ${person.name}!`);
  }
  console.info("Hello, World!");
});
