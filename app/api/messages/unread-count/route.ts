import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ count: 0 });

  const count = await prisma.message.count({
    where: { receiverId: userId, read: false },
  });

  return NextResponse.json({ count });
}
