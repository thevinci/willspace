import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { DbConnection, tables } from "../src/module_bindings";

function loadEnvironmentFiles() {
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) {
      loadEnvFile(file);
    }
  }
}

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

function isLinkedInWrapped(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.hasOwnProperty.call(value, "linkedIn")
  );
}

async function main() {
  loadEnvironmentFiles();

  const applyChanges = process.argv.includes("--apply");
  const host = normalizeSpacetimeHost(
    getEnv("SPACETIMEDB_HOST", process.env.VITE_SPACETIMEDB_HOST),
  );
  const dbName = getEnv(
    "SPACETIMEDB_DB_NAME",
    process.env.VITE_SPACETIMEDB_DB_NAME,
  );

  console.log(`Connecting to SpacetimeDB: ${host}/${dbName}`);
  const conn = await connectSpacetime(host, dbName);

  try {
    const people = [...conn.db.directoryPerson.iter()];
    let alreadyWrapped = 0;
    let invalidJson = 0;
    let migrated = 0;

    for (const person of people) {
      let currentData: unknown;
      try {
        currentData = JSON.parse(person.dataJson);
      } catch {
        invalidJson += 1;
        console.warn(
          `Skipping person ${person.id}: dataJson is not valid JSON`,
        );
        continue;
      }

      if (isLinkedInWrapped(currentData)) {
        alreadyWrapped += 1;
        continue;
      }

      migrated += 1;
      if (!applyChanges) continue;

      await conn.reducers.updateDirectoryPerson({
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        company: person.company,
        title: person.title,
        bio: person.bio,
        categoryKey: person.categoryKey,
        categories: person.categories,
        email: person.email,
        phone: person.phone,
        city: person.city,
        state: person.state,
        zip: person.zip,
        country: person.country,
        website: person.website,
        profileImage: person.profileImage,
        dataJson: JSON.stringify({ linkedIn: currentData }),
      });
    }

    console.log(`Rows scanned: ${people.length}`);
    console.log(
      `Rows ${applyChanges ? "migrated" : "to migrate"}: ${migrated}`,
    );
    console.log(`Rows already wrapped: ${alreadyWrapped}`);
    console.log(`Rows skipped for invalid JSON: ${invalidJson}`);

    if (!applyChanges && migrated > 0) {
      console.log("Dry run only. Re-run with --apply to update the rows.");
    }
  } finally {
    conn.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
