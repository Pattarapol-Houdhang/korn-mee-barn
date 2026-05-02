import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(30).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: data.name, phone: data.phone || null },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
