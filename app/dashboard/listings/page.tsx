"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, statusLabel } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/components/shared/LanguageProvider";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  DRAFT: "bg-gray-100 text-gray-700",
  SOLD: "bg-red-100 text-red-800",
  RENTED: "bg-red-100 text-red-800",
};

export default function MyListingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProperties() {
    try {
      const res = await fetch("/api/dashboard/properties");
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch { setProperties([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchProperties(); }, []);

  async function deleteProperty(id: string) {
    if (!confirm(t.dashboard.deleteConfirm)) return;
    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success(t.dashboard.listingDeleted); fetchProperties(); }
    else toast.error(t.dashboard.failedDelete);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success(t.dashboard.statusUpdated); fetchProperties(); }
    else toast.error(t.dashboard.failedUpdate);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.myListings}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {properties.length} {properties.length !== 1 ? t.dashboard.listings : t.dashboard.listing}
          </p>
        </div>
        <Button asChild>
          <Link href="/listings/new"><Plus className="w-4 h-4 mr-2" />{t.dashboard.newListing}</Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500 mb-4">{t.dashboard.noListings}</p>
          <Button asChild><Link href="/listings/new">{t.dashboard.postFirstListing}</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => {
            const images = (() => { try { return JSON.parse(p.images) as string[]; } catch { return []; } })();
            const thumb = images[0] ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200";

            return (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-sm transition-shadow">
                <img src={thumb} alt={p.title} className="w-20 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{p.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{p.address}, {p.city}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {statusLabel(p.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-bold text-primary">{formatPrice(p.price, p.transactionType)}</span>
                    <span className="text-xs text-gray-400">{(t.labels?.propertyTypes as any)?.[p.propertyType] ?? p.propertyType}</span>
                    <span className="text-xs text-gray-400">{formatDate(p.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/properties/${p.id}`}><Eye className="w-4 h-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/listings/${p.id}/edit`}><Edit className="w-4 h-4" /></Link>
                  </Button>
                  {p.status === "ACTIVE" && (
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(p.id, "SOLD")} title={t.dashboard.markSold} className="text-xs px-1">
                      {t.dashboard.markSold}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteProperty(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
