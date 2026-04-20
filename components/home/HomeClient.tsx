"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Shield, TrendingUp, Star, Home, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useLanguage } from "@/components/shared/LanguageProvider";
import { CITIES, PROPERTY_TYPES } from "@/lib/utils";

export function HomeClient({ featured }: { featured: any[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchCity, setSearchCity] = useState("all");
  const [searchType, setSearchType] = useState("all");
  const [searchPropType, setSearchPropType] = useState("all");
  const [activeTab, setActiveTab] = useState<"SALE" | "RENT" | "LEASE">("SALE");

  function handleSearch() {
    const params = new URLSearchParams();
    if (searchCity !== "all") params.set("city", searchCity);
    params.set("type", activeTab);
    if (searchPropType !== "all") params.set("propertyType", searchPropType);
    router.push(`/search?${params}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#012d08] via-[#023f0b] to-[#03600f] text-white py-24 px-4 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-green-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            {t.home.statsListings} {t.home.statsCustomers ? "· " + t.home.statsCustomers : ""}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
            {t.home.heroTitle}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-300">
              {t.home.heroSubtitle}
            </span>
          </h1>
          <p className="text-base text-green-100/80 mb-10 max-w-lg mx-auto">
            {t.home.heroDesc}
          </p>

          {/* Search card */}
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.25)] max-w-3xl mx-auto overflow-hidden">
            {/* Tab strip */}
            <div className="flex">
              {([["SALE", t.home.buy], ["RENT", t.home.rent], ["LEASE", t.home.lease]] as const).map(([val, label], i) => (
                <button key={val} onClick={() => setActiveTab(val)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-150 relative
                    ${activeTab === val
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}
                    ${i !== 2 ? "border-r border-gray-100" : ""}`}>
                  {label}
                  {activeTab === val && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-300" />
                  )}
                </button>
              ))}
            </div>

            {/* Filter row */}
            <div className="p-5 flex flex-col sm:flex-row gap-3">
              {/* City picker */}
              <div className="flex-1 group flex items-center gap-2.5 bg-gray-50 border border-gray-200 hover:border-primary/40 rounded-xl px-3.5 py-2 transition-colors">
                <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-0.5">{t.search.city}</p>
                  <Select value={searchCity} onValueChange={setSearchCity}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none h-auto p-0 focus:ring-0 text-sm font-medium text-gray-800">
                      <SelectValue placeholder={t.search.allCities} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.search.allCities}</SelectItem>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px bg-gray-200 my-1" />

              {/* Property type picker */}
              <div className="flex-1 group flex items-center gap-2.5 bg-gray-50 border border-gray-200 hover:border-primary/40 rounded-xl px-3.5 py-2 transition-colors">
                <Home className="w-4 h-4 text-primary/70 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-0.5">{t.search.propertyType}</p>
                  <Select value={searchPropType} onValueChange={setSearchPropType}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none h-auto p-0 focus:ring-0 text-sm font-medium text-gray-800">
                      <SelectValue placeholder={t.search.allTypes} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.search.allTypes}</SelectItem>
                      {PROPERTY_TYPES.map((tp) => (
                        <SelectItem key={tp} value={tp}>
                          {(t.labels?.propertyTypes as any)?.[tp] ?? tp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search button */}
              <Button onClick={handleSearch} size="lg" className="rounded-xl px-8 shrink-0 h-auto py-3.5 text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                <Search className="w-4 h-4 mr-2" />{t.home.search}
              </Button>
            </div>
          </div>

          {/* Quick city links */}
          <div className="flex justify-center items-center gap-2 mt-6 text-sm">
            <span className="text-green-300/60 text-xs">{t.search.city}:</span>
            {["Bangkok", "Chiang Mai", "Phuket"].map((city, i) => (
              <>
                {i > 0 && <span key={`sep-${city}`} className="text-green-300/30">·</span>}
                <button key={city} onClick={() => { setSearchCity(city); handleSearch(); }}
                  className="text-green-200 hover:text-white text-xs font-medium underline underline-offset-2 decoration-green-300/40 hover:decoration-white transition-colors">
                  {city}
                </button>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "10,000+", label: t.home.statsListings },
            { value: "5,000+", label: t.home.statsCustomers },
            { value: "3", label: t.home.statsCities },
            { value: "98%", label: t.home.statsSatisfaction },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.home.latestProperties}</h2>
            <p className="text-gray-500 text-sm mt-1">{t.home.latestDesc}</p>
          </div>
          <Button variant="outline" asChild><Link href="/search">{t.home.viewAll}</Link></Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => <PropertyCard key={p.id} property={p as any} />)}
        </div>
      </section>

      {/* Browse by city */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t.home.browseByCity}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { city: "Bangkok", image: "https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=600", desc: t.home.bangkokDesc },
              { city: "Chiang Mai", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600", desc: t.home.chiangMaiDesc },
              { city: "Phuket", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600", desc: t.home.phuketDesc },
            ].map(({ city, image, desc }) => (
              <Link key={city} href={`/search?city=${city}`}>
                <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-200 hover:shadow-xl transition-all duration-200">
                  <img src={image} alt={city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-xl font-bold mb-1">{city}</h3>
                    <p className="text-sm text-white/80">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">{t.home.whyTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Shield className="w-7 h-7 text-primary" />, title: t.home.verifiedListings, desc: t.home.verifiedDesc },
            { icon: <TrendingUp className="w-7 h-7 text-primary" />, title: t.home.bestPrices, desc: t.home.bestPricesDesc },
            { icon: <Star className="w-7 h-7 text-primary" />, title: t.home.topAgents, desc: t.home.topAgentsDesc },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">{icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{t.home.readyToList}</h2>
        <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">{t.home.readyDesc}</p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/listings/new">{t.home.postFree}</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <p className="text-white font-semibold mb-3">Kon Mee Barn</p>
            <p>{t.home.footerDesc}</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">{t.home.footerBrowse}</p>
            <ul className="space-y-1">
              <li><Link href="/search?type=SALE" className="hover:text-white">{t.home.footerForSale}</Link></li>
              <li><Link href="/search?type=RENT" className="hover:text-white">{t.home.footerForRent}</Link></li>
              <li><Link href="/search?type=LEASE" className="hover:text-white">{t.home.footerForLease}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">{t.home.footerCities}</p>
            <ul className="space-y-1">
              <li><Link href="/search?city=Bangkok" className="hover:text-white">Bangkok</Link></li>
              <li><Link href="/search?city=Chiang+Mai" className="hover:text-white">Chiang Mai</Link></li>
              <li><Link href="/search?city=Phuket" className="hover:text-white">Phuket</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">{t.home.footerAccount}</p>
            <ul className="space-y-1">
              <li><Link href="/login" className="hover:text-white">{t.nav.signIn}</Link></li>
              <li><Link href="/register" className="hover:text-white">{t.nav.register}</Link></li>
              <li><Link href="/listings/new" className="hover:text-white">{t.home.footerPostListing}</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-800 text-center text-xs">
          {t.home.footerCopyright}
        </div>
      </footer>
    </div>
  );
}
