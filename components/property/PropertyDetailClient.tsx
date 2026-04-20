"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, Bed, Bath, Square, Heart, Phone, ChevronLeft, ChevronRight,
  Share2, Building2, ShieldCheck, X, Car, Calendar, Layers, Sofa
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, formatDate, statusLabel } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/shared/LanguageProvider";

const MapView = dynamic(() => import("@/components/shared/MapView"), { ssr: false, loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse" /> });

interface Props {
  property: any;
  userId?: string;
  userRole?: string;
  isFavorited: boolean;
}

export function PropertyDetailClient({ property, userId, userRole, isFavorited: initialFav }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);
  const [favorited, setFavorited] = useState(initialFav);
  const [favLoading, setFavLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images: string[] = (() => { try { return JSON.parse(property.images); } catch { return []; } })();
  const amenities: string[] = (() => { try { return JSON.parse(property.amenities); } catch { return []; } })();
  const thumb = (i: number) => images[i] ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800";

  const openLightbox = (i: number) => { setLightboxIndex(i); setLightboxOpen(true); };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prevImg = useCallback(() => setLightboxIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const nextImg = useCallback(() => setLightboxIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "ArrowRight") nextImg();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, closeLightbox, prevImg, nextImg]);

  async function toggleFavorite() {
    if (!userId) { router.push("/login"); return; }
    setFavLoading(true);
    try {
      const res = await fetch(`/api/favorites/${property.id}`, { method: favorited ? "DELETE" : "POST" });
      if (res.ok) { setFavorited(!favorited); toast.success(favorited ? t.property.removedFromFavorites : t.property.savedToFavorites); }
    } catch { toast.error("Something went wrong"); }
    finally { setFavLoading(false); }
  }

  async function sendMessage() {
    if (!userId) { router.push("/login"); return; }
    if (!message.trim()) { toast.error("Please enter a message"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id, receiverId: property.owner.id, content: message }),
      });
      if (res.ok) { toast.success("Message sent!"); setMessage(""); setDialogOpen(false); }
      else toast.error("Failed to send message");
    } catch { toast.error("Something went wrong"); }
    finally { setSending(false); }
  }

  const furnishingLabel = (v: string) => ({ FULLY_FURNISHED: t.listing.fullyFurnished, SEMI_FURNISHED: t.listing.semiFurnished, UNFURNISHED: t.listing.unfurnished }[v] ?? v);
  const transactionColor = { SALE: "bg-blue-100 text-blue-800", RENT: "bg-green-100 text-green-800", LEASE: "bg-purple-100 text-purple-800" }[property.transactionType as string] ?? "bg-gray-100 text-gray-800";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 p-2 text-white hover:text-gray-300" onClick={closeLightbox}>
            <X className="w-8 h-8" />
          </button>
          <button className="absolute left-4 p-3 text-white hover:text-gray-300" onClick={(e) => { e.stopPropagation(); prevImg(); }}>
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img
            src={thumb(lightboxIndex)}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="absolute right-4 p-3 text-white hover:text-gray-300" onClick={(e) => { e.stopPropagation(); nextImg(); }}>
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="absolute bottom-4 text-white/70 text-sm">{lightboxIndex + 1} / {images.length}</div>
        </div>
      )}

      {/* Admin back */}
      {userRole === "ADMIN" && (
        <div className="mb-4">
          <Link href="/admin/listings" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ShieldCheck className="w-4 h-4" />{t.property.backToAdmin}
          </Link>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">{t.property.home}</Link>
        <span>/</span>
        <Link href="/search" className="hover:text-primary">{t.property.properties}</Link>
        <span>/</span>
        <Link href={`/search?city=${property.city}`} className="hover:text-primary">{property.city}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main image */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[16/10] cursor-zoom-in" onClick={() => openLightbox(currentImage)}>
            <img src={thumb(currentImage)} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setCurrentImage((i) => (i - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow hover:bg-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setCurrentImage((i) => (i + 1) % images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow hover:bg-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }} className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? "bg-white" : "bg-white/50"}`} />)}
                </div>
                <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {currentImage + 1}/{images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => { setCurrentImage(i); openLightbox(i); }}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImage ? "border-primary" : "border-transparent hover:border-gray-300"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${transactionColor}`}>{(t.labels?.transactionTypes as any)?.[property.transactionType] ?? property.transactionType}</span>
              <Badge variant="secondary">{(t.labels?.propertyTypes as any)?.[property.propertyType] ?? property.propertyType}</Badge>
              {property.status !== "ACTIVE" && <Badge variant="outline">{statusLabel(property.status)}</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <div className="flex items-center gap-1 text-gray-500 mb-4">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{property.address}, {property.city}</span>
            </div>
            <p className="text-3xl font-bold text-primary mb-6">{formatPrice(property.price, property.transactionType)}</p>

            {/* Specs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {property.bedrooms > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Bed className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{property.bedrooms}</p>
                  <p className="text-xs text-gray-500">{t.property.bedrooms}</p>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Bath className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-xs text-gray-500">{t.property.bathrooms}</p>
                </div>
              )}
              {property.squareFeet && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Square className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{property.squareFeet.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{t.property.sqft}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Building2 className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900">{(t.labels?.propertyTypes as any)?.[property.propertyType] ?? property.propertyType}</p>
                <p className="text-xs text-gray-500">{t.property.type}</p>
              </div>
            </div>

            {/* Extra details */}
            {(property.yearBuilt || property.furnishing || property.parkingSpaces || property.floorNumber) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                {property.yearBuilt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-secondary flex-shrink-0" />
                    <div><p className="text-xs text-gray-500">{t.listing.yearBuilt}</p><p className="font-semibold">{property.yearBuilt}</p></div>
                  </div>
                )}
                {property.floorNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Layers className="w-4 h-4 text-secondary flex-shrink-0" />
                    <div><p className="text-xs text-gray-500">{t.listing.floorNumber}</p><p className="font-semibold">{property.floorNumber}</p></div>
                  </div>
                )}
                {property.parkingSpaces != null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-secondary flex-shrink-0" />
                    <div><p className="text-xs text-gray-500">{t.listing.parkingSpaces}</p><p className="font-semibold">{property.parkingSpaces}</p></div>
                  </div>
                )}
                {property.furnishing && (
                  <div className="flex items-center gap-2 text-sm">
                    <Sofa className="w-4 h-4 text-secondary flex-shrink-0" />
                    <div><p className="text-xs text-gray-500">{t.listing.furnishing}</p><p className="font-semibold">{furnishingLabel(property.furnishing)}</p></div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t.property.aboutProperty}</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{t.property.amenities}</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => <span key={a} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">{a}</span>)}
                </div>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{t.property.location}</h2>
                <MapView lat={property.latitude} lng={property.longitude} title={property.title} />
              </div>
            )}
            <p className="text-xs text-gray-400">{t.property.listedOn} {formatDate(property.createdAt)}</p>
          </div>
        </div>

        {/* Right: Contact card */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sticky top-20">
            <p className="text-2xl font-bold text-primary mb-1">{formatPrice(property.price, property.transactionType)}</p>
            <p className="text-sm text-gray-500 mb-5">{property.address}, {property.city}</p>
            <div className="flex gap-2 mb-4">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1">{t.property.contactOwner}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Contact {property.owner.name}</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="font-medium text-sm">{property.title}</p>
                      <p className="text-xs text-gray-500">{property.address}</p>
                    </div>
                    <Textarea placeholder="Hi, I'm interested in this property. Is it still available?" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
                    <Button className="w-full" onClick={sendMessage} disabled={sending}>{sending ? "Sending…" : "Send Message"}</Button>
                    {!userId && <p className="text-xs text-center text-gray-500"><Link href="/login" className="text-primary hover:underline">Sign in</Link> to send a message</p>}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="icon" onClick={toggleFavorite} disabled={favLoading}>
                <Heart className={`w-4 h-4 ${favorited ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </Button>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.property.listedBy}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">{property.owner.name?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{property.owner.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{property.owner.role?.toLowerCase()}</p>
                </div>
              </div>
              {property.owner.phone && (
                <a href={`tel:${property.owner.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary">
                  <Phone className="w-4 h-4" />{property.owner.phone}
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success(t.property.linkCopied); }}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4" /> {t.property.share}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
