import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const [totalUsers, totalProperties, pendingCount, activeCount] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.property.count({ where: { status: "PENDING" } }),
    prisma.property.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <AdminDashboardClient
      totalUsers={totalUsers}
      totalProperties={totalProperties}
      pendingCount={pendingCount}
      activeCount={activeCount}
    />
  );
}
