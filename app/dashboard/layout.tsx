"use client";

import Link from "next/link";
import { LayoutDashboard, Heart, MessageSquare } from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  const NAV = [
    { href: "/dashboard/listings", label: t.dashboard.myListings, icon: LayoutDashboard },
    { href: "/dashboard/favorites", label: t.dashboard.savedProperties, icon: Heart },
    { href: "/dashboard/messages", label: t.dashboard.messages, icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <nav className="space-y-1 sticky top-24">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 mb-6 overflow-x-auto pb-1 w-full">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 whitespace-nowrap border border-gray-200">
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
