"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, LayoutGrid, List, Search } from "lucide-react";
import { CITIES, PROPERTY_TYPES, TRANSACTION_TYPES } from "@/lib/utils";
import { useLanguage } from "@/components/shared/LanguageProvider";

function SearchContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const BEDROOM_OPTIONS = [
    { value: "any", label: t.search.bedroomsAny },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
  ];

  const [properties, setProperties] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [city, setCity] = useState(searchParams.get("city") ?? "all");
  const [type, setType] = useState(searchParams.get("type") ?? "all");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") ?? "all");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") ?? "any");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [page, setPage] = useState(1);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (city && city !== "all") params.set("city", city);
    if (type && type !== "all") params.set("type", type);
    if (propertyType && propertyType !== "all") params.set("propertyType", propertyType);
    if (bedrooms && bedrooms !== "any") params.set("bedrooms", bedrooms);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/properties?${params}`);
      const data = await res.json();
      setProperties(data.properties ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [city, type, propertyType, bedrooms, maxPrice, page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  function clearFilters() {
    setCity("all");
    setType("all");
    setPropertyType("all");
    setBedrooms("any");
    setMaxPrice("");
    setPage(1);
  }

  const hasFilters = city !== "all" || type !== "all" || propertyType !== "all" || bedrooms !== "any" || maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.search.title}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading ? t.search.loading : `${total.toLocaleString()} ${t.search.propertiesFound}`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t.search.city}</label>
            <Select value={city} onValueChange={(v) => { setCity(v); setPage(1); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t.search.allCities} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.search.allCities}</SelectItem>
                {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t.search.transaction}</label>
            <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t.search.buyOrRent} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.search.buyOrRent}</SelectItem>
                {TRANSACTION_TYPES.map((tp) => (
                  <SelectItem key={tp} value={tp}>{(t.labels?.transactionTypes as any)?.[tp] ?? tp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t.search.propertyType}</label>
            <Select value={propertyType} onValueChange={(v) => { setPropertyType(v); setPage(1); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t.search.allTypes} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.search.allTypes}</SelectItem>
                {PROPERTY_TYPES.map((tp) => (
                  <SelectItem key={tp} value={tp}>{(t.labels?.propertyTypes as any)?.[tp] ?? tp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t.search.bedrooms}</label>
            <Select value={bedrooms} onValueChange={(v) => { setBedrooms(v); setPage(1); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t.search.bedroomsAny} />
              </SelectTrigger>
              <SelectContent>
                {BEDROOM_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t.search.maxPrice}</label>
            <Input
              className="h-9"
              type="number"
              placeholder="e.g. 5000000"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            />
          </div>

          {hasFilters && (
            <Button variant="outline" size="sm" className="h-9" onClick={clearFilters}>
              {t.search.clear}
            </Button>
          )}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 text-xs text-gray-500">
          {hasFilters && (
            <div className="flex flex-wrap gap-1">
              {city !== "all" && <Badge variant="secondary">{city}</Badge>}
              {type !== "all" && <Badge variant="secondary">{(t.labels?.transactionTypes as any)?.[type] ?? type}</Badge>}
              {propertyType !== "all" && <Badge variant="secondary">{(t.labels?.propertyTypes as any)?.[propertyType] ?? propertyType}</Badge>}
              {bedrooms !== "any" && <Badge variant="secondary">{bedrooms}+ beds</Badge>}
              {maxPrice && <Badge variant="secondary">Max ฿{parseInt(maxPrice).toLocaleString()}</Badge>}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setView("grid")} className={`p-2 rounded ${view === "grid" ? "bg-primary/10 text-primary" : "text-gray-400 hover:bg-gray-100"}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={`p-2 rounded ${view === "list" ? "bg-primary/10 text-primary" : "text-gray-400 hover:bg-gray-100"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">{t.search.noResults}</h3>
          <p className="text-gray-400 text-sm mb-4">{t.search.tryAdjusting}</p>
          <Button variant="outline" onClick={clearFilters}>{t.search.clearFilters}</Button>
        </div>
      ) : (
        <>
          <div className={view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
          }>
            {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              {t.search.previous}
            </Button>
            <span className="text-sm text-gray-500">
              {t.search.page} {page} {t.search.of} {Math.ceil(total / 12)}
            </span>
            <Button variant="outline" disabled={page * 12 >= total} onClick={() => setPage((p) => p + 1)}>
              {t.search.next}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
