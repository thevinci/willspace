const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string | undefined;
const CONVEX_API_BASE_URL = CONVEX_URL?.replace(/\/$/, "");

type ConvexCallType = "mutation" | "query";

async function callConvex<T>(
  type: ConvexCallType,
  path: string,
  args: Record<string, unknown>,
): Promise<T> {
  if (!CONVEX_API_BASE_URL) {
    throw new Error("Set VITE_CONVEX_URL");
  }

  const response = await fetch(`${CONVEX_API_BASE_URL}/api/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path, args }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Convex ${type} ${path} failed: ${message}`);
  }

  const payload = (await response.json()) as {
    status?: "success" | "error";
    errorMessage?: string;
  };

  if (payload.status === "error") {
    throw new Error(payload.errorMessage ?? `Convex ${type} ${path} failed`);
  }

  return payload as T;
}

async function callConvexWithFallback<T>(
  type: ConvexCallType,
  paths: string[],
  args: Record<string, unknown>,
) {
  let lastError: unknown = null;

  for (const path of paths) {
    try {
      return await callConvex<T>(type, path, args);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

type GenerateUploadUrlResult = {
  value: string;
};

type UploadResult = {
  storageId: string;
};

type GetStorageUrlResult = {
  value: string | null;
};

export async function generateUploadUrl() {
  const result = await callConvexWithFallback<GenerateUploadUrlResult>(
    "mutation",
    ["storage:generateUploadUrl", "directory:generateUploadUrl"],
    {},
  );
  return result.value;
}

export function isConvexStorageConfigured() {
  return !!CONVEX_API_BASE_URL;
}

export async function uploadFileToConvexStorage(file: File) {
  const uploadUrl = await generateUploadUrl();

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Convex storage upload failed: ${message}`);
  }

  const payload = (await response.json()) as UploadResult;
  return payload.storageId;
}

export async function getStorageUrl(storageId: string) {
  const result = await callConvexWithFallback<GetStorageUrlResult>(
    "query",
    ["storage:getStorageUrl", "directory:getStorageUrl"],
    { storageId },
  );
  return result.value;
}
