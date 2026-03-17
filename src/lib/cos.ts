import COS from "cos-nodejs-sdk-v5";
import { randomUUID } from "crypto";

const requiredEnvVars = [
  "COS_SECRET_ID",
  "COS_SECRET_KEY",
  "COS_BUCKET",
  "COS_REGION",
  "COS_PUBLIC_BASE_URL",
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

function getEnvVar(name: RequiredEnvVar) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function isCosConfigured() {
  return requiredEnvVars.every((name) => Boolean(process.env[name]));
}

function getCosClient() {
  return new COS({
    SecretId: getEnvVar("COS_SECRET_ID"),
    SecretKey: getEnvVar("COS_SECRET_KEY"),
  });
}

function getPublicBaseUrl() {
  return getEnvVar("COS_PUBLIC_BASE_URL").replace(/\/+$/, "");
}

function getFileExtension(fileName: string, mimeType: string) {
  const sanitizedName = fileName.trim();
  const match = sanitizedName.match(/\.([a-zA-Z0-9]+)$/);
  if (match) {
    return match[1].toLowerCase();
  }

  const mimeToExtension: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "image/svg+xml": "svg",
  };

  return mimeToExtension[mimeType] ?? "bin";
}

export function buildAvatarObjectKey(userId: string, fileName: string, mimeType: string) {
  const extension = getFileExtension(fileName, mimeType);
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `avatars/${year}/${month}/${userId}/${randomUUID()}.${extension}`;
}

export function buildCosFileUrl(key: string) {
  return `${getPublicBaseUrl()}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function uploadBufferToCos(params: {
  body: Buffer;
  key: string;
  contentType: string;
}) {
  const cos = getCosClient();

  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: getEnvVar("COS_BUCKET"),
        Region: getEnvVar("COS_REGION"),
        Key: params.key,
        Body: params.body,
        ContentLength: params.body.length,
        ContentType: params.contentType,
        ACL: "public-read",
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });

  return {
    key: params.key,
    url: buildCosFileUrl(params.key),
  };
}
