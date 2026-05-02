import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  if (ids.length === 0) return NextResponse.json([]);

  const properties = await prisma.property.findMany({
    where: { id: { in: ids } },
    include: { owner: { select: { id: true, name: true, phone: true } } },
  });

  const ordered = ids.map((id) => properties.find((p) => p.id === id)).filter(Boolean);
  return NextResponse.json(ordered);
}
