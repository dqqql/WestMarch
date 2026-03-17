import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/repositories";
import { buildAvatarObjectKey, isCosConfigured, uploadBufferToCos } from "@/lib/cos";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    if (!isCosConfigured()) {
      return NextResponse.json(
        { error: "COS storage is not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const name = formData.get("name");
    const category = formData.get("category");
    const userId = formData.get("userId");

    if (!(file instanceof File) || typeof name !== "string" || typeof category !== "string" || typeof userId !== "string") {
      return NextResponse.json({ error: "Missing required upload fields" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are supported" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image file is too large. Please keep avatar files under 5MB." },
        { status: 400 }
      );
    }

    const user = await repositories.user.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const objectKey = buildAvatarObjectKey(userId, file.name, file.type);
    const uploadedFile = await uploadBufferToCos({
      body: buffer,
      key: objectKey,
      contentType: file.type,
    });

    const resource = await repositories.resource.create({
      name: name.trim() || file.name,
      url: uploadedFile.url,
      category,
      userId,
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Upload resource error:", error);
    return NextResponse.json({ error: "Failed to upload resource" }, { status: 500 });
  }
}
