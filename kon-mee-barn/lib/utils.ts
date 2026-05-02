import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, transactionType: string): string {
  if (transactionType === "RENT" || transactionType === "LEASE") {
    return `฿${price.toLocaleString()}/mo`;
  }
  if (price >= 1000000) {
    return `฿${(price / 1000000).toFixed(1)}M`;
  }
  return `฿${price.toLocaleString()}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const PROPERTY_TYPES = ["HOUSE", "APARTMENT", "CONDO", "TOWNHOUSE", "LAND", "COMMERCIAL"] as const;
export const TRANSACTION_TYPES = ["SALE", "RENT", "LEASE"] as const;
export const LISTING_STATUSES = ["DRAFT", "PENDING", "ACTIVE", "SOLD", "RENTED"] as const;
export const CITIES = [
  "Bangkok",
  "Chiang Mai",
  "Phuket",
  "Pattaya",
  "Hua Hin",
  "Khon Kaen",
  "Chiang Rai",
  "Nakhon Ratchasima",
  "Hat Yai",
  "Udon Thani",
  "Rayong",
  "Samut Prakan",
  "Nonthaburi",
  "Pathum Thani",
  "Ubon Ratchathani",
  "Nakhon Si Thammarat",
  "Surat Thani",
  "Krabi",
  "Koh Samui",
  "Koh Phangan",
  "Koh Chang",
  "Lampang",
  "Phitsanulok",
  "Nakhon Pathom",
  "Ayutthaya",
  "Kanchanaburi",
  "Prachuap Khiri Khan",
  "Chumphon",
  "Songkhla",
  "Trang",
  "Phang Nga",
  "Ranong",
  "Satun",
  "Narathiwat",
  "Pattani",
  "Yala",
  "Loei",
  "Nakhon Phanom",
  "Mukdahan",
  "Sakon Nakhon",
  "Buriram",
  "Surin",
  "Sisaket",
  "Amnat Charoen",
  "Yasothon",
  "Roi Et",
  "Kalasin",
  "Maha Sarakham",
  "Chaiyaphum",
  "Nong Khai",
  "Nong Bua Lamphu",
  "Mae Hong Son",
  "Nan",
  "Phrae",
  "Phayao",
  "Uttaradit",
  "Sukhothai",
  "Tak",
  "Kamphaeng Phet",
  "Phichit",
  "Nakhon Sawan",
  "Uthai Thani",
  "Chai Nat",
  "Sing Buri",
  "Ang Thong",
  "Lopburi",
  "Saraburi",
  "Nakhon Nayok",
  "Prachin Buri",
  "Sa Kaeo",
  "Chanthaburi",
  "Trat",
  "Chonburi",
  "Samut Sakhon",
  "Samut Songkhram",
  "Ratchaburi",
  "Suphan Buri",
  "Phetchaburi",
] as const;

export const AMENITIES = [
  "Pool", "Gym", "Parking", "Security", "Garden",
  "Balcony", "Air Conditioning", "Elevator", "Pet Friendly", "Furnished",
];

export function propertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    HOUSE: "House", APARTMENT: "Apartment", CONDO: "Condo",
    TOWNHOUSE: "Townhouse", LAND: "Land", COMMERCIAL: "Commercial",
  };
  return labels[type] ?? type;
}

export function transactionTypeLabel(type: string): string {
  const labels: Record<string, string> = { SALE: "For Sale", RENT: "For Rent", LEASE: "For Lease" };
  return labels[type] ?? type;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Draft", PENDING: "Pending Review", ACTIVE: "Active",
    SOLD: "Sold", RENTED: "Rented",
  };
  return labels[status] ?? status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "secondary", PENDING: "warning", ACTIVE: "success",
    SOLD: "destructive", RENTED: "destructive",
  };
  return colors[status] ?? "secondary";
}
