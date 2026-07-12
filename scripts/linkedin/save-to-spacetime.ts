import fs from "fs";
import { DbConnection, tables } from "../../src/module_bindings";

type LinkedInProfile = {
  name: string;
  headline?: string;
  location?: string;
  profileImage?: string | null;
  company?: string;
  college?: string;
  about?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedinUrl?: string;
  birthday?: string;
  linkedInJoinDate?: string;
  connectedSince?: string;
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

function parseLocation(location?: string) {
  const parts = (location ?? "").split(",").map((p) => p.trim());
  return {
    city: parts[0] ?? "",
    state: parts[1] ?? "",
    country: parts[2] ?? "",
  };
}

function parseName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") ?? "";
  return { firstName, lastName };
}

function normalizePhone(phone?: string) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.startsWith("+")) return phone.replace(/\s/g, "");
  return digits ? phone.trim() : undefined;
}

async function uploadProfileImage(imageUrl?: string | null) {
  if (!imageUrl) return "";

  const convexUrl = getEnv("VITE_CONVEX_URL", process.env.CONVEX_URL).replace(
    /\/$/,
    "",
  );
  let uploadUrlPayload: {
    status?: string;
    value?: string;
    errorMessage?: string;
  } | null = null;
  let lastError = "";

  for (const path of [
    "storage:generateUploadUrl",
    "directory:generateUploadUrl",
  ]) {
    const response = await fetch(`${convexUrl}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, args: {} }),
    });
    const payload = (await response.json()) as typeof uploadUrlPayload & {
      errorMessage?: string;
    };
    if (response.ok && payload?.value) {
      uploadUrlPayload = payload;
      break;
    }
    lastError = payload?.errorMessage ?? `HTTP ${response.status}`;
  }

  if (!uploadUrlPayload) {
    throw new Error(`Convex upload URL request failed: ${lastError}`);
  }

  if (uploadUrlPayload.status === "error" || !uploadUrlPayload.value) {
    throw new Error(
      uploadUrlPayload.errorMessage ?? "Convex did not return an upload URL",
    );
  }

  console.log("Downloading LinkedIn profile image...");
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(
      `Profile image download failed (${imageResponse.status}): ${imageUrl}`,
    );
  }

  const uploadResponse = await fetch(uploadUrlPayload.value, {
    method: "POST",
    headers: {
      "Content-Type": imageResponse.headers.get("content-type") ?? "image/jpeg",
    },
    body: await imageResponse.arrayBuffer(),
  });
  if (!uploadResponse.ok) {
    throw new Error(
      `Convex image upload failed: ${await uploadResponse.text()}`,
    );
  }

  const uploadPayload = (await uploadResponse.json()) as { storageId?: string };
  if (!uploadPayload.storageId) {
    throw new Error("Convex did not return a storage ID");
  }

  console.log(`Profile image uploaded to Convex: ${uploadPayload.storageId}`);
  return uploadPayload.storageId;
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
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error(
      "Usage: npx tsx scripts/linkedin/save-to-spacetime.ts <path-to-profile.json>",
    );
    console.error(
      "Ensure SPACETIMEDB_HOST and SPACETIMEDB_DB_NAME are set (or VITE_ prefixed variants from .env.local).",
    );
    console.error(
      "Example: export $(grep -E '^(SPACETIMEDB_HOST|SPACETIMEDB_DB_NAME)=' .env.local | xargs) && npx tsx scripts/linkedin/save-to-spacetime.ts profile.json",
    );
    process.exit(1);
  }

  const data = JSON.parse(
    fs.readFileSync(jsonPath, "utf-8"),
  ) as LinkedInProfile;

  const { firstName, lastName } = parseName(data.name);
  if (!firstName || !lastName) {
    throw new Error(`Could not parse name from: "${data.name}"`);
  }

  const { city, state, country } = parseLocation(data.location);
  const email = data.email?.trim() || undefined;
  const phone = normalizePhone(data.phone);
  const profileImage = await uploadProfileImage(data.profileImage);

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
    const payload = {
      firstName,
      lastName,
      company: data.company?.trim() ?? "",
      title: data.headline?.trim() ?? "",
      bio: data.about?.trim() ?? "",
      categoryKey: "linkedin",
      categories: ["linkedin"],
      email,
      phone,
      city,
      state,
      zip: "",
      country,
      website: data.website?.trim() ?? "",
      // The UI resolves this Convex storage ID through getStorageUrl().
      profileImage,
      dataJson: JSON.stringify({
        source: "linkedin",
        linkedinUrl: data.linkedinUrl,
        college: data.college,
        birthday: data.birthday,
        linkedInJoinDate: data.linkedInJoinDate ?? data.connectedSince,
        raw: data,
      }),
    };

    console.log("Calling createDirectoryPerson reducer...");
    await conn.reducers.createDirectoryPerson(payload);
    console.log("✅ Saved LinkedIn profile to SpacetimeDB");
  } finally {
    conn.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
