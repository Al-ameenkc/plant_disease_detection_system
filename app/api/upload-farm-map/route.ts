import { NextResponse } from "next/server";
import path from "path";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const BUCKET = "farm-maps";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const ext = path.extname(file.name) || "";
    const objectKey = `farm_map_${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectKey, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        { message: "Failed to upload to storage" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(objectKey);

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Farm map upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
