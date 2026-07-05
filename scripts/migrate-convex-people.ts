import { DbConnection, tables } from "../src/module_bindings";

type ConvexPerson = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
  bio?: string;
  categoryKey?: string;
  categories?: string[];
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  profileImageId?: string;
  importedData?: unknown;
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

async function fetchConvexPeople(convexUrl: string) {
  const response = await fetch(`${convexUrl.replace(/\/$/, "")}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: "directory:peopleList", args: {} }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to fetch Convex people: ${message}`);
  }

  const payload = (await response.json()) as ConvexQueryResponse<
    ConvexPerson[]
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
          .subscribe([tables.directoryPerson]);
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

  const people = await fetchConvexPeople(sourceConvexUrl);
  console.log(`Fetched ${people.length} people from Convex`);

  const conn = await connectSpacetime(spacetimeHost, spacetimeDbName);

  try {
    await conn.reducers.clearDirectoryPeople();
    console.log("Cleared existing directoryPerson rows");

    let inserted = 0;
    let sanitizedPhones = 0;

    for (let index = 0; index < people.length; index += 1) {
      const person = people[index];
      const convexId = person._id ?? `index-${index}`;

      const firstName = (person.firstName ?? "").trim() || "Unknown";
      const lastName = (person.lastName ?? "").trim() || "Person";

      const email = (person.email ?? "").trim().toLowerCase();
      const rawPhone = (person.phone ?? "").trim();
      const phone = rawPhone.startsWith("+1999") ? "" : rawPhone;
      if (rawPhone && !phone) {
        sanitizedPhones += 1;
      }

      const payload = {
        firstName,
        lastName,
        company: (person.company ?? "").trim(),
        title: (person.position ?? "").trim(),
        bio: (person.bio ?? "").trim(),
        categoryKey: (person.categoryKey ?? "").trim(),
        categories: person.categories ?? [],
        email: email || undefined,
        phone: phone || undefined,
        city: (person.city ?? "").trim(),
        state: (person.state ?? "").trim(),
        zip: "",
        country: (person.country ?? "").trim(),
        website: (person.website ?? "").trim(),
        profileImage: (person.profileImageId ?? "").trim(),
        dataJson: JSON.stringify({
          migratedFrom: "convex.directoryPeople",
          convexId,
          importedData: person.importedData ?? null,
        }),
      };

      await conn.reducers.createDirectoryPerson(payload);
      inserted += 1;
    }

    console.log(`Inserted ${inserted} people into SpacetimeDB`);
    console.log(`Sanitized ${sanitizedPhones} placeholder +1999 phones`);
  } finally {
    conn.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
