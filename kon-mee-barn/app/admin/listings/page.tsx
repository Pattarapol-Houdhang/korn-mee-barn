"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function AdminListingsPage() {
  const { t } = useLanguage();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  async function fetchProperties() {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties?status=${filter}&limit=50`);
      const data = await res.json();
      setProperties(data.properties ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProperties(); }, [filter]);

  async function action(id: string, act: "approve" | "reject") {
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    if (res.ok) {
      toast.success(act === "approve" ? t.admin.approved : t.admin.rejected);
      fetchProperties();
    } else {
      toast.error(t.admin.actionFailed);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.admin.listingModeration}</h1>
        <Link href="/admin" className="text-sm text-primary hover:underline">{t.admin.backDashboard}</Link>
      </div>

      <div className="flex gap-2 mb-6">
        {["PENDING", "ACTIVE", "DRAFT"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors
              ${filter === s ? "bg-primary text-primary-foreground" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500">{t.admin.noListings} {filter.toLowerCase()}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => {
            const images = (() => { try { return JSON.parse(p.images) as string[]; } catch { return []; } })();
            const thumb = images[0] ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200";

            return (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
                <img src={thumb} alt={p.title} className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{p.address}, {p.city}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-sm font-bold text-primary">{formatPrice(p.price, p.transactionType)}</span>
                    <span className="text-xs text-gray-400">{(t.labels?.propertyTypes as any)?.[p.propertyType] ?? p.propertyType}</span>
                    <span className="text-xs text-gray-400">{(t.labels?.transactionTypes as any)?.[p.transactionType] ?? p.transactionType}</span>
                    <span className="text-xs text-gray-400">{formatDate(p.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{t.admin.owner}: {p.owner?.name ?? "Unknown"}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/properties/${p.id}`} target="_blank"><Eye className="w-4 h-4" /></Link>
                  </Button>
                  {filter === "PENDING" && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => action(p.id, "approve")}>
                        <Check className="w-4 h-4 mr-1" />{t.admin.approve}
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8" onClick={() => action(p.id, "reject")}>
                        <X className="w-4 h-4 mr-1" />{t.admin.reject}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
