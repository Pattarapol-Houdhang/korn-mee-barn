"use client";

import { ListingForm } from "@/components/listing/ListingForm";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function NewListingPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.listing.pageTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to list your property</p>
      </div>
      <ListingForm />
    </div>
  );
}
