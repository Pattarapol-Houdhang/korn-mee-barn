import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    await prisma.favorite.create({ data: { userId, propertyId: params.id } });
    return NextResponse.json({ favorited: true });
  } catch {
    return NextResponse.json({ error: "Already favorited" }, { status: 409 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  await prisma.favorite.deleteMany({ where: { userId, propertyId: params.id } });
  return NextResponse.json({ favorited: false });
}
