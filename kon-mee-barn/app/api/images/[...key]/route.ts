import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET_NAME } from "@/lib/s3";

export async function GET(_req: NextRequest, { params }: { params: { key: string[] } }) {
  const key = params.key.join("/");

  try {
    const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    const bytes = await obj.Body?.transformToByteArray();
    if (!bytes) return new NextResponse("Not found", { status: 404 });

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": obj.ContentType ?? "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
