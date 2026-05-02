"use client";

import Link from "next/link";
import { Users, Building2, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/shared/LanguageProvider";

interface Props {
  totalUsers: number;
  totalProperties: number;
  pendingCount: number;
  activeCount: number;
}

export function AdminDashboardClient({ totalUsers, totalProperties, pendingCount, activeCount }: Props) {
  const { t } = useLanguage();

  const stats = [
    { label: t.admin.totalUsers, value: totalUsers, icon: Users, color: "bg-primary/10 text-primary" },
    { label: t.admin.totalListings, value: totalProperties, icon: Building2, color: "bg-purple-50 text-purple-600" },
    { label: t.admin.pendingReview, value: pendingCount, icon: Clock, color: "bg-yellow-50 text-yellow-600" },
    { label: t.admin.activeListings, value: activeCount, icon: CheckCircle, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t.admin.dashboard}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className={`inline-flex p-2.5 rounded-xl ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/admin/listings">{t.admin.reviewPending} ({pendingCount})</Link>
        </Button>
      </div>
    </div>
  );
}
