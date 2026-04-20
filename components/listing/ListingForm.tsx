"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { CITIES, PROPERTY_TYPES, TRANSACTION_TYPES, AMENITIES } from "@/lib/utils";
import { useLanguage } from "@/components/shared/LanguageProvider";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  propertyType: z.string().min(1, "Select property type"),
  transactionType: z.string().min(1, "Select transaction type"),
  price: z.string().min(1, "Price is required"),
  bedrooms: z.string(),
  bathrooms: z.string(),
  squareFeet: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "Select a city"),
  yearBuilt: z.string().optional(),
  furnishing: z.string().optional(),
  parkingSpaces: z.string().optional(),
  floorNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props { property?: any; }

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
];

const FURNISHING_OPTIONS = ["FULLY_FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"];

export function ListingForm({ property }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const isEditing = !!property;
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    property ? (() => { try { return JSON.parse(property.amenities); } catch { return []; } })() : []
  );
  const [images, setImages] = useState<string[]>(
    property ? (() => { try { return JSON.parse(property.images); } catch { return []; } })() : []
  );
  const [propertyType, setPropertyType] = useState(property?.propertyType ?? "");
  const [transactionType, setTransactionType] = useState(property?.transactionType ?? "");
  const [city, setCity] = useState(property?.city ?? "");
  const [furnishing, setFurnishing] = useState(property?.furnishing ?? "");

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: property?.title ?? "",
      description: property?.description ?? "",
      propertyType: property?.propertyType ?? "",
      transactionType: property?.transactionType ?? "",
      price: property?.price?.toString() ?? "",
      bedrooms: property?.bedrooms?.toString() ?? "0",
      bathrooms: property?.bathrooms?.toString() ?? "1",
      squareFeet: property?.squareFeet?.toString() ?? "",
      address: property?.address ?? "",
      city: property?.city ?? "",
      yearBuilt: property?.yearBuilt?.toString() ?? "",
      furnishing: property?.furnishing ?? "",
      parkingSpaces: property?.parkingSpaces?.toString() ?? "",
      floorNumber: property?.floorNumber?.toString() ?? "",
    },
  });

  function toggleAmenity(a: string) {
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  function addDemoImage() {
    const img = DEMO_IMAGES[images.length % DEMO_IMAGES.length];
    if (!images.includes(img)) setImages([...images, img]);
    else setImages([...images, `${DEMO_IMAGES[(images.length + 1) % DEMO_IMAGES.length]}?v=${images.length}`]);
  }

  async function onSubmit(data: FormData, saveAsDraft = false) {
    setLoading(true);
    const payload = {
      ...data,
      price: parseFloat(data.price),
      bedrooms: parseInt(data.bedrooms),
      bathrooms: parseFloat(data.bathrooms),
      squareFeet: data.squareFeet ? parseInt(data.squareFeet) : undefined,
      yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : undefined,
      parkingSpaces: data.parkingSpaces ? parseInt(data.parkingSpaces) : undefined,
      floorNumber: data.floorNumber ? parseInt(data.floorNumber) : undefined,
      furnishing: data.furnishing || undefined,
      images: JSON.stringify(images.length ? images : [DEMO_IMAGES[0]]),
      amenities: JSON.stringify(selectedAmenities),
      status: saveAsDraft ? "DRAFT" : "PENDING",
    };

    try {
      const res = await fetch(isEditing ? `/api/properties/${property.id}` : "/api/properties", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(isEditing ? "Listing updated!" : saveAsDraft ? "Saved as draft" : "Listing submitted for review!");
        router.push("/dashboard/listings");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save listing");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const furnishingLabel = (v: string) => ({ FULLY_FURNISHED: t.listing.fullyFurnished, SEMI_FURNISHED: t.listing.semiFurnished, UNFURNISHED: t.listing.unfurnished }[v] ?? v);

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d))}>
      <div className="space-y-8">

        {/* Basic Info */}
        <div className="space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">{t.listing.basicInfo}</h2>
          <div>
            <Label>{t.listing.listingTitle}</Label>
            <Input className="mt-1" placeholder={t.listing.titlePlaceholder} {...register("title")} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label>{t.listing.description}</Label>
            <Textarea className="mt-1" rows={4} placeholder={t.listing.descPlaceholder} {...register("description")} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t.listing.propertyType}</Label>
              <Select value={propertyType} onValueChange={(v) => { setPropertyType(v); setValue("propertyType", v); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.listing.selectType} /></SelectTrigger>
                <SelectContent>{PROPERTY_TYPES.map((tp) => <SelectItem key={tp} value={tp}>{(t.labels?.propertyTypes as any)?.[tp] ?? tp}</SelectItem>)}</SelectContent>
              </Select>
              {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType.message}</p>}
            </div>
            <div>
              <Label>{t.listing.transactionType}</Label>
              <Select value={transactionType} onValueChange={(v) => { setTransactionType(v); setValue("transactionType", v); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.listing.forSaleRent} /></SelectTrigger>
                <SelectContent>{TRANSACTION_TYPES.map((tp) => <SelectItem key={tp} value={tp}>{(t.labels?.transactionTypes as any)?.[tp] ?? tp}</SelectItem>)}</SelectContent>
              </Select>
              {errors.transactionType && <p className="text-red-500 text-xs mt-1">{errors.transactionType.message}</p>}
            </div>
          </div>
        </div>

        {/* Location & Details */}
        <div className="space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">{t.listing.locationDetails}</h2>
          <div>
            <Label>{t.listing.address}</Label>
            <Input className="mt-1" placeholder={t.listing.addressPlaceholder} {...register("address")} />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <Label>{t.listing.city}</Label>
            <Select value={city} onValueChange={(v) => { setCity(v); setValue("city", v); }}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={t.listing.selectCity} /></SelectTrigger>
              <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t.listing.bedrooms}</Label>
              <Input className="mt-1" type="number" min="0" {...register("bedrooms")} />
            </div>
            <div>
              <Label>{t.listing.bathrooms}</Label>
              <Input className="mt-1" type="number" min="0" step="0.5" {...register("bathrooms")} />
            </div>
            <div>
              <Label>{t.listing.sqft}</Label>
              <Input className="mt-1" type="number" min="0" {...register("squareFeet")} />
            </div>
          </div>
          {/* Extra details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t.listing.yearBuilt}</Label>
              <Input className="mt-1" type="number" min="1900" max="2030" placeholder="e.g. 2020" {...register("yearBuilt")} />
            </div>
            <div>
              <Label>{t.listing.floorNumber}</Label>
              <Input className="mt-1" type="number" min="1" placeholder="e.g. 5" {...register("floorNumber")} />
            </div>
            <div>
              <Label>{t.listing.parkingSpaces}</Label>
              <Input className="mt-1" type="number" min="0" placeholder="e.g. 1" {...register("parkingSpaces")} />
            </div>
            <div>
              <Label>{t.listing.furnishing}</Label>
              <Select value={furnishing} onValueChange={(v) => { setFurnishing(v); setValue("furnishing", v); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.listing.selectFurnishing} /></SelectTrigger>
                <SelectContent>
                  {FURNISHING_OPTIONS.map((f) => <SelectItem key={f} value={f}>{furnishingLabel(f)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-2 block">{t.listing.amenities}</Label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedAmenities.includes(a) ? "bg-primary text-primary-foreground border-primary" : "border-gray-300 text-gray-600 hover:border-primary/50"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price & Images */}
        <div className="space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">{t.listing.priceImages}</h2>
          <div>
            <Label>{t.listing.price} {transactionType === "RENT" || transactionType === "LEASE" ? "(฿/month)" : "(฿)"}</Label>
            <Input className="mt-1" type="number" min="0" placeholder="e.g. 5000000" {...register("price")} />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <Label className="mb-2 block">{t.listing.images}</Label>
            <p className="text-xs text-gray-500 mb-3">{t.listing.imagesNote}</p>
            <Button type="button" variant="outline" onClick={addDemoImage} className="mb-3 w-full">
              <Upload className="w-4 h-4 mr-2" />{t.listing.addDemoImage} ({images.length}/10)
            </Button>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow hover:bg-white">
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-200">
          <Button type="button" variant="outline" disabled={loading} onClick={() => onSubmit(getValues(), true)}>
            {t.listing.saveDraft}
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? t.listing.saveChanges : t.listing.submitListing}
          </Button>
        </div>

      </div>
    </form>
  );
}
