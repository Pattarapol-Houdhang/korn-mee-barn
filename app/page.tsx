import { prisma } from "@/lib/prisma";
import { HomeClient } from "@/components/home/HomeClient";

async function getFeaturedProperties() {
  return prisma.property.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

export default async function HomePage() {
  const featured = await getFeaturedProperties();
  return <HomeClient featured={featured as any[]} />;
}
