import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city");
  const type = searchParams.get("type");
  const propertyType = searchParams.get("propertyType");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const bedrooms = searchParams.get("bedrooms");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");
  const status = searchParams.get("status") ?? "ACTIVE";

  const where: any = { status };

  if (city && city !== "all") where.city = city;
  if (type && type !== "all") where.transactionType = type;
  if (propertyType && propertyType !== "all") where.propertyType = propertyType;
  if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
  if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
  if (bedrooms && bedrooms !== "any") where.bedrooms = { gte: parseInt(bedrooms) };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { owner: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({ properties, total, page, limit });
}

const createSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  propertyType: z.string(),
  transactionType: z.string(),
  price: z.number().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  squareFeet: z.number().optional(),
  address: z.string().min(5),
  city: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.string(),
  amenities: z.string(),
  status: z.string().default("PENDING"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const ownerId = (session.user as any).id;

    const property = await prisma.property.create({
      data: { ...data, ownerId },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
