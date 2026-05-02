import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  propertyId: z.string(),
  receiverId: z.string(),
  content: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const senderId = (session.user as any).id;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const message = await prisma.message.create({
      data: { ...data, senderId },
    });

    console.log(`[Message] ${senderId} → ${data.receiverId}: "${data.content.slice(0, 50)}"`);

    return NextResponse.json(message, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      property: { select: { id: true, title: true, images: true } },
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(messages);
}
