import { DbConnection, tables } from "../src/module_bindings";

type ConvexCategory = {
  _id?: string;
  key?: string;
  name?: string;
  count?: number;
  description?: string;
  level?: number;
};

type ConvexQueryResponse<T> = {
  value: T;
};

function getEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeSpacetimeHost(host: string) {
  if (host.startsWith("https://")) {
    return `wss://${host.slice("https://".length)}`;
  }
  if (host.startsWith("http://")) {
    return `ws://${host.slice("http://".length)}`;
  }
  return host;
}

async function fetchConvexCategories(convexUrl: string) {
  const response = await fetch(`${convexUrl.replace(/\/$/, "")}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: "directory:categoriesList", args: {} }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to fetch Convex categories: ${message}`);
  }

  const payload = (await response.json()) as ConvexQueryResponse<
    ConvexCategory[]
  >;
  return payload.value ?? [];
}

async function connectSpacetime(host: string, dbName: string) {
  return await new Promise<DbConnection>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out connecting to SpacetimeDB"));
    }, 15000);

    DbConnection.builder()
      .withUri(host)
      .withDatabaseName(dbName)
      .onConnect((conn) => {
        conn
          .subscriptionBuilder()
          .onApplied(() => {
            clearTimeout(timeout);
            resolve(conn);
          })
          .onError((ctx) => {
            clearTimeout(timeout);
            conn.disconnect();
            reject(ctx.event ?? new Error("Subscription failed"));
          })
          .subscribe([tables.directoryCategory]);
      })
      .onConnectError((_ctx, error) => {
        clearTimeout(timeout);
        reject(error);
      })
      .build();
  });
}

async function main() {
  const sourceConvexUrl = getEnv(
    "SOURCE_CONVEX_URL",
    process.env.VITE_CONVEX_URL,
  );
  const spacetimeHost = normalizeSpacetimeHost(
    getEnv("SPACETIMEDB_HOST", process.env.VITE_SPACETIMEDB_HOST),
  );
  const spacetimeDbName = getEnv(
    "SPACETIMEDB_DB_NAME",
    process.env.VITE_SPACETIMEDB_DB_NAME,
  );

  console.log(`Source Convex: ${sourceConvexUrl}`);
  console.log(`Target SpacetimeDB: ${spacetimeHost}/${spacetimeDbName}`);

  const categories = await fetchConvexCategories(sourceConvexUrl);
  console.log(`Fetched ${categories.length} categories from Convex`);

  const conn = await connectSpacetime(spacetimeHost, spacetimeDbName);

  try {
    let inserted = 0;

    for (let index = 0; index < categories.length; index += 1) {
      const category = categories[index];
      const key = (category.key ?? "").trim();
      if (!key) {
        continue;
      }

      const name = (category.name ?? "").trim() || key;
      const description = (category.description ?? "").trim();
      const level = Number.isFinite(category.level) ? category.level! : 1;

      await conn.reducers.createDirectoryCategory({
        key,
        name,
        description,
        level,
      });

      inserted += 1;
    }

    console.log(`Inserted ${inserted} categories into SpacetimeDB`);
    console.log(
      "Note: directory_category.count is initialized to 0 by reducer and not copied from Convex.",
    );
  } finally {
    conn.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
