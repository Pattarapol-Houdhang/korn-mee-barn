"use client";

import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Square } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/shared/LanguageProvider";
import { useRouter } from "next/navigation";

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  address: string;
  propertyType: string;
  transactionType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number | null;
  images: string;
  status: string;
  isFavorited?: boolean;
}

interface PropertyCardProps {
  property: Property;
  showFavorite?: boolean;
  onFavoriteChange?: () => void;
}

export function PropertyCard({ property, showFavorite = true, onFavoriteChange }: PropertyCardProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const [favorited, setFavorited] = useState(property.isFavorited ?? false);
  const [loading, setLoading] = useState(false);

  const images = (() => {
    try { return JSON.parse(property.images) as string[]; } catch { return []; }
  })();

  const thumb = images[0] ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400";

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/favorites/${property.id}`, {
        method: favorited ? "DELETE" : "POST",
      });
      if (res.ok) {
        setFavorited(!favorited);
        toast.success(favorited ? "Removed from favorites" : "Saved to favorites");
        onFavoriteChange?.();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const transactionBadgeColor = {
    SALE: "bg-blue-100 text-blue-800",
    RENT: "bg-green-100 text-green-800",
    LEASE: "bg-purple-100 text-purple-800",
  }[property.transactionType] ?? "bg-gray-100 text-gray-800";

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={thumb}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${transactionBadgeColor}`}>
              {(t.labels?.transactionTypes as any)?.[property.transactionType] ?? property.transactionType}
            </span>
          </div>
          {showFavorite && (
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${favorited ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"}`}
              />
            </button>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
          </div>

          <p className="text-xl font-bold text-primary mb-2">
            {formatPrice(property.price, property.transactionType)}
          </p>

          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.address}, {property.city}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 border-t border-gray-100 pt-3">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {(t.labels?.propertyTypes as any)?.[property.propertyType] ?? property.propertyType}
            </span>
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="w-3 h-3" />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="w-3 h-3" />
                {property.bathrooms}
              </span>
            )}
            {property.squareFeet && (
              <span className="flex items-center gap-1">
                <Square className="w-3 h-3" />
                {property.squareFeet.toLocaleString()} sqft
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
