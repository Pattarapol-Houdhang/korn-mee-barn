"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, Bed, Bath, Square, MapPin, Check, Minus, Loader2, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCompare } from "@/components/shared/CompareProvider";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function ComparePage() {
  const router = useRouter();
  const { ids, remove, clear } = useCompare();
  const { t } = useLanguage();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/properties/by-ids?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => setProperties(Array.isArray(d) ? d : []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [ids]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (ids.length === 0 || properties.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
          <GitCompareArrows className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nothing to compare yet</h1>
        <p className="text-gray-500 mb-6">Pick up to 3 listings from the search page using the compare icon on each card.</p>
        <Button asChild><Link href="/search">{t.search.title}</Link></Button>
      </div>
    );
  }

  const getImages = (p: any) => { try { return JSON.parse(p.images) as string[]; } catch { return []; } };
  const getAmenities = (p: any) => { try { return JSON.parse(p.amenities) as string[]; } catch { return []; } };

  const allAmenities = Array.from(new Set(properties.flatMap(getAmenities))).sort();

  const furnishingLabel = (v?: string | null) => v ? ({
    FULLY_FURNISHED: t.listing.fullyFurnished,
    SEMI_FURNISHED: t.listing.semiFurnished,
    UNFURNISHED: t.listing.unfurnished,
  } as Record<string, string>)[v] ?? v : "—";

  const gridCols = properties.length === 1 ? "grid-cols-[200px_1fr]" : properties.length === 2 ? "grid-cols-[200px_1fr_1fr]" : "grid-cols-[200px_1fr_1fr_1fr]";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Compare Properties</h1>
          <p className="text-sm text-gray-500 mt-1">{properties.length} {properties.length === 1 ? "listing" : "listings"} side-by-side</p>
        </div>
        <Button variant="outline" size="sm" onClick={clear}>{t.search.clearCompare}</Button>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <div className={`grid ${gridCols} gap-4 min-w-[800px]`}>
          {/* Header row: thumbnails */}
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-4">Listing</div>
          {properties.map((p) => {
            const images = getImages(p);
            const thumb = images[0] ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400";
            return (
              <div key={p.id} className="relative bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => remove(p.id)} className="absolute top-2 right-2 z-10 p-1 bg-white/95 rounded-full shadow hover:bg-red-50">
                  <X className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                </button>
                <Link href={`/properties/${p.id}`}>
                  <div className="aspect-[4/3] bg-gray-100">
                    <img src={thumb} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1 hover:text-primary">{p.title}</h3>
                    <p className="text-lg font-bold text-primary">{formatPrice(p.price, p.transactionType)}</p>
                  </div>
                </Link>
              </div>
            );
          })}

          {/* Spec rows */}
          <Row label={t.property.type} values={properties.map((p) => (t.labels?.propertyTypes as any)?.[p.propertyType] ?? p.propertyType)} />
          <Row label={t.search.transaction} values={properties.map((p) => (t.labels?.transactionTypes as any)?.[p.transactionType] ?? p.transactionType)} />
          <Row label={t.search.city} values={properties.map((p) => (
            <span key={p.id} className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />{p.city}</span>
          ))} />
          <Row label={t.property.bedrooms} values={properties.map((p) => (
            <span key={p.id} className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-gray-400" />{p.bedrooms}</span>
          ))} />
          <Row label={t.property.bathrooms} values={properties.map((p) => (
            <span key={p.id} className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-gray-400" />{p.bathrooms}</span>
          ))} />
          <Row label={t.property.sqft} values={properties.map((p) => p.squareFeet ? (
            <span key={p.id} className="flex items-center gap-1"><Square className="w-3.5 h-3.5 text-gray-400" />{p.squareFeet.toLocaleString()}</span>
          ) : <Minus key={p.id} className="w-4 h-4 text-gray-300" />)} />
          <Row label={t.listing.yearBuilt} values={properties.map((p) => <span key={p.id}>{p.yearBuilt ?? <Minus className="w-4 h-4 text-gray-300" />}</span>)} />
          <Row label={t.listing.floorNumber} values={properties.map((p) => <span key={p.id}>{p.floorNumber ?? <Minus className="w-4 h-4 text-gray-300" />}</span>)} />
          <Row label={t.listing.parkingSpaces} values={properties.map((p) => <span key={p.id}>{p.parkingSpaces ?? <Minus className="w-4 h-4 text-gray-300" />}</span>)} />
          <Row label={t.listing.furnishing} values={properties.map((p) => furnishingLabel(p.furnishing))} />
          <Row label={t.property.listedBy} values={properties.map((p) => p.owner?.name ?? "—")} />

          {/* Amenity matrix */}
          {allAmenities.length > 0 && (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-4 col-span-full border-t border-gray-200 mt-2">
                {t.property.amenities}
              </div>
              {allAmenities.map((amenity) => (
                <Row
                  key={amenity}
                  label={amenity}
                  values={properties.map((p) => getAmenities(p).includes(amenity)
                    ? <Check key={p.id} className="w-4 h-4 text-primary" />
                    : <Minus key={p.id} className="w-4 h-4 text-gray-300" />
                  )}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, values }: { label: string; values: React.ReactNode[] }) {
  return (
    <>
      <div className="text-sm text-gray-500 py-2.5 border-b border-gray-100">{label}</div>
      {values.map((v, i) => (
        <div key={i} className="text-sm text-gray-900 font-medium py-2.5 border-b border-gray-100">{v}</div>
      ))}
    </>
  );
}
