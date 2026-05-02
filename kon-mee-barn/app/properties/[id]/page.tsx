import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PropertyDetailClient } from "@/components/property/PropertyDetailClient";

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, email: true, phone: true, role: true } },
      favorites: { select: { userId: true } },
    },
  });

  if (!property) notFound();

  const session = await auth();
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;
  const isFavorited = userId ? property.favorites.some((f) => f.userId === userId) : false;

  const similar = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      status: "ACTIVE",
      OR: [
        { city: property.city, propertyType: property.propertyType },
        { city: property.city, transactionType: property.transactionType },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <PropertyDetailClient
      property={property as any}
      userId={userId}
      userRole={userRole}
      isFavorited={isFavorited}
      similar={similar as any[]}
    />
  );
}
