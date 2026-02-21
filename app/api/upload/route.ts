import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, verifyAuth } from "@/lib/supabase-server";

const BUCKET = "portfolio-images";

/**
 * POST /api/upload
 * Accepts a multipart form with a "file" field.
 * Requires a valid Supabase access token in the Authorization header.
 * Uploads the file to Supabase Storage and returns the public URL.
 */
export async function POST(req: NextRequest) {
  try {
    /* ── Auth ── */
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await verifyAuth(token);

    /* ── Parse file ── */
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG, AVIF" },
        { status: 400 }
      );
    }

    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 5 MB." },
        { status: 400 }
      );
    }

    const db = createServerSupabase();

    /* ── Ensure bucket exists ── */
    const { data: buckets } = await db.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET);
    if (!exists) {
      await db.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: allowedTypes,
      });
    }

    /* ── Upload ── */
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    /* ── Get public URL ── */
    const {
      data: { publicUrl },
    } = db.storage.from(BUCKET).getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
