import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET_NAME } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (property.ownerId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { imageUrl } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

  // Strip /api/images/ prefix to get S3 key
  const key = (imageUrl as string).replace(/^\/api\/images\//, "");

  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
  } catch (err) {
    console.error("[delete-image] S3 error:", err);
  }

  const current: string[] = (() => { try { return JSON.parse(property.images); } catch { return []; } })();
  const updated = await prisma.property.update({
    where: { id: params.id },
    data: { images: JSON.stringify(current.filter((u) => u !== imageUrl)) },
  });

  const newImages: string[] = (() => { try { return JSON.parse(updated.images); } catch { return []; } })();
  return NextResponse.json({ images: newImages });
}
