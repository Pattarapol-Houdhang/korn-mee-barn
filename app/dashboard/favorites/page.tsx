"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function FavoritesPage() {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchFavorites() {
    try {
      const res = await fetch("/api/dashboard/favorites");
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch { setFavorites([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchFavorites(); }, []);

  async function removeFavorite(propertyId: string) {
    const res = await fetch(`/api/favorites/${propertyId}`, { method: "DELETE" });
    if (res.ok) { toast.success(t.dashboard.removedFav); fetchFavorites(); }
    else toast.error(t.dashboard.failedRemove);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.savedProperties}</h1>
        <p className="text-gray-500 text-sm mt-1">{favorites.length} {t.dashboard.saved}</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">{t.dashboard.noSaved}</p>
          <Button asChild><Link href="/search">{t.dashboard.browseProperties}</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map(({ property, id }) => {
            const images = (() => { try { return JSON.parse(property.images) as string[]; } catch { return []; } })();
            const thumb = images[0] ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400";

            return (
              <div key={id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/9] bg-gray-100">
                  <img src={thumb} alt={property.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFavorite(property.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white"
                    title="Remove"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{property.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{property.city}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-primary font-bold">{formatPrice(property.price, property.transactionType)}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/properties/${property.id}`}>
                        <ExternalLink className="w-3 h-3 mr-1" />{t.dashboard.view}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
