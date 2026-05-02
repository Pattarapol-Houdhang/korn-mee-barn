import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ListingForm } from "@/components/listing/ListingForm";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) notFound();

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (property.ownerId !== userId && role !== "ADMIN") redirect("/dashboard/listings");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-500 text-sm mt-1">{property.title}</p>
      </div>
      <ListingForm property={property as any} />
    </div>
  );
}
