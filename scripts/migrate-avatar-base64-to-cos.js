const COS = require("cos-nodejs-sdk-v5");
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

loadEnvironmentFiles();

const prisma = new PrismaClient();

const requiredEnvVars = [
  "COS_SECRET_ID",
  "COS_SECRET_KEY",
  "COS_BUCKET",
  "COS_REGION",
  "COS_PUBLIC_BASE_URL",
];

function loadEnvironmentFiles() {
  if (typeof process.loadEnvFile !== "function") {
    return;
  }

  for (const file of [".env.local", ".env", ".env.production"]) {
    try {
      process.loadEnvFile(file);
    } catch (error) {
      if (error && error.code !== "ENOENT") {
        throw error;
      }
    }
  }
}

function getEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function assertEnv() {
  for (const name of requiredEnvVars) {
    getEnvVar(name);
  }
}

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

function buildFileUrl(key) {
  const baseUrl = getEnvVar("COS_PUBLIC_BASE_URL").replace(/\/+$/, "");
  return `${baseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function getExtensionFromMime(mimeType) {
  const mimeToExtension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "image/svg+xml": "svg",
  };

  return mimeToExtension[mimeType] ?? "bin";
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) {
    throw new Error("Invalid data URL");
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

async function uploadDataUrl({ scope, ownerId, dataUrl }) {
  const { mimeType, buffer } = parseDataUrl(dataUrl);
  const extension = getExtensionFromMime(mimeType);
  const key = `avatars/legacy/${scope}/${ownerId || "unknown"}/${randomUUID()}.${extension}`;

  await new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: getEnvVar("COS_BUCKET"),
        Region: getEnvVar("COS_REGION"),
        Key: key,
        Body: buffer,
        ContentLength: buffer.length,
        ContentType: mimeType,
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

  return buildFileUrl(key);
}

async function migrateRecords({ label, items, getValue, updateRecord, getOwnerId }) {
  let migrated = 0;

  for (const item of items) {
    const value = getValue(item);
    if (typeof value !== "string" || !value.startsWith("data:image/")) {
      continue;
    }

    const nextUrl = await uploadDataUrl({
      scope: label,
      ownerId: getOwnerId(item),
      dataUrl: value,
    });

    await updateRecord(item, nextUrl);
    migrated += 1;
    console.log(`[migrated] ${label} ${item.id} -> ${nextUrl}`);
  }

  return migrated;
}

async function main() {
  assertEnv();

  const [resources, characters, users, userSettings, mapCharacters] = await Promise.all([
    prisma.resourceImage.findMany({
      where: { url: { startsWith: "data:image/" } },
      select: { id: true, userId: true, url: true },
    }),
    prisma.character.findMany({
      where: { img: { startsWith: "data:image/" } },
      select: { id: true, userId: true, img: true },
    }),
    prisma.user.findMany({
      where: { avatar: { startsWith: "data:image/" } },
      select: { id: true, avatar: true },
    }),
    prisma.userSetting.findMany({
      where: { userAvatar: { startsWith: "data:image/" } },
      select: { id: true, userId: true, userAvatar: true },
    }),
    prisma.mapCharacter.findMany({
      where: { avatar: { startsWith: "data:image/" } },
      select: { id: true, nodeId: true, avatar: true },
    }),
  ]);

  const summary = {
    resources: await migrateRecords({
      label: "resources",
      items: resources,
      getValue: (item) => item.url,
      getOwnerId: (item) => item.userId,
      updateRecord: (item, url) =>
        prisma.resourceImage.update({
          where: { id: item.id },
          data: { url },
        }),
    }),
    characters: await migrateRecords({
      label: "characters",
      items: characters,
      getValue: (item) => item.img,
      getOwnerId: (item) => item.userId,
      updateRecord: (item, url) =>
        prisma.character.update({
          where: { id: item.id },
          data: { img: url },
        }),
    }),
    users: await migrateRecords({
      label: "users",
      items: users,
      getValue: (item) => item.avatar,
      getOwnerId: (item) => item.id,
      updateRecord: (item, url) =>
        prisma.user.update({
          where: { id: item.id },
          data: { avatar: url },
        }),
    }),
    userSettings: await migrateRecords({
      label: "user-settings",
      items: userSettings,
      getValue: (item) => item.userAvatar,
      getOwnerId: (item) => item.userId,
      updateRecord: (item, url) =>
        prisma.userSetting.update({
          where: { id: item.id },
          data: { userAvatar: url },
        }),
    }),
    mapCharacters: await migrateRecords({
      label: "map-characters",
      items: mapCharacters,
      getValue: (item) => item.avatar,
      getOwnerId: (item) => item.nodeId,
      updateRecord: (item, url) =>
        prisma.mapCharacter.update({
          where: { id: item.id },
          data: { avatar: url },
        }),
    }),
  };

  console.log("\nMigration summary:");
  console.table(summary);
}

main()
  .catch((error) => {
    console.error("Avatar migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
