import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action } = await req.json();

  const status = action === "approve" ? "ACTIVE" : "DRAFT";
  const property = await prisma.property.update({
    where: { id: params.id },
    data: { status },
  });

  console.log(`[Admin] Property ${params.id} ${action}d by ${(session.user as any).email}`);

  return NextResponse.json(property);
}
