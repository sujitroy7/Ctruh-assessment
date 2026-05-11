import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import ColorSelector from "./_components/ColorSelector";
import GenderSelector from "./_components/GenderSelector";
import AddToCartButton from "./_components/AddToCartButton";

interface ProductItem {
  id: string;
  gender: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
  is_deleted: boolean;
}

interface Product {
  id: string;
  name: string;
  type: string;
  is_deleted: boolean;
  items: ProductItem[];
}

// Dummy data matching the API shape — replace with real fetch using params.id
const products: Record<string, Product> = {
  "1": {
    id: "1",
    name: "Product One",
    type: "Electronics",
    is_deleted: false,
    items: [
      {
        id: "1-a",
        gender: "unisex",
        color: "#3b82f6",
        price: 29.99,
        stock: 12,
        images: [],
        is_deleted: false,
      },
    ],
  },
  "2": {
    id: "2",
    name: "Product Two",
    type: "Clothing",
    is_deleted: false,
    items: [
      {
        id: "2-a",
        gender: "men",
        color: "#111827",
        price: 49.99,
        stock: 5,
        images: [],
        is_deleted: false,
      },
      {
        id: "2-b",
        gender: "women",
        color: "#f9a8d4",
        price: 49.99,
        stock: 0,
        images: [],
        is_deleted: false,
      },
    ],
  },
  "3": {
    id: "3",
    name: "Product Three",
    type: "Books",
    is_deleted: false,
    items: [
      {
        id: "3-a",
        gender: "unisex",
        color: "#f59e0b",
        price: 19.99,
        stock: 0,
        images: [],
        is_deleted: false,
      },
    ],
  },
  "4": {
    id: "4",
    name: "Product Four",
    type: "Electronics",
    is_deleted: false,
    items: [
      {
        id: "4-a",
        gender: "unisex",
        color: "#6366f1",
        price: 89.99,
        stock: 3,
        images: [],
        is_deleted: false,
      },
    ],
  },
};

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const isOwner = session?.user?.role === "owner";
  const product = products[id];

  if (!product || product.is_deleted) notFound();

  const activeItems = product.items.filter((item) => !item.is_deleted);
  const image =
    activeItems.find((item) => item.images.length > 0)?.images[0] ?? "";
  const minPrice =
    activeItems.length > 0
      ? Math.min(...activeItems.map((i) => i.price))
      : null;
  const colors = [...new Set(activeItems.map((i) => i.color.toLowerCase()))];
  const genders = [...new Set(activeItems.map((i) => i.gender.toLowerCase()))];
  const types = [product.type];
  const inStock = activeItems.some((i) => i.stock > 0);

  return (
    <div className="max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted mb-6 mt-4">
        <Link href="/" className="hover:text-ink-soft transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-ink-soft truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 items-start">
        {/* Image */}
        <div className="relative w-full aspect-square rounded-lg bg-neutral-100 border border-border overflow-hidden flex flex-col items-center justify-center gap-2">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <span className="text-sm font-medium text-ink-disabled">
              Image Not Available
            </span>
          )}
        </div>

        {/* Details card */}
        <div className="flex flex-col">
          {/* Card body */}
          <div className="flex flex-col flex-1 gap-4 px-5 py-5">
            {/* Name */}
            <h1 className="text-2xl font-bold leading-tight text-ink">
              {product.name}
            </h1>

            {/* Price */}
            {minPrice !== null && (
              <div>
                <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-0.5">
                  Price
                </p>
                <p className="text-2xl font-bold font-mono text-ink">
                  ${minPrice.toFixed(2)}
                </p>
              </div>
            )}

            <hr className="border-border" />

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
                  Colors
                </p>
                <ColorSelector colors={colors} defaultColor={colors[0]} />
              </div>
            )}

            {/* Gender */}
            {genders.length > 0 && (
              <div>
                <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
                  For
                </p>
                <GenderSelector genders={genders} defaultGender={genders[0]} />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-auto pt-1">
              {isOwner ? (
                <Link
                  href={`/admin/products/${id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-ink text-ink-inverse text-sm font-semibold hover:bg-ink/90 active:scale-[0.98] transition-all"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Product
                </Link>
              ) : (
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  items={activeItems}
                  defaultColor={colors[0]}
                  defaultGender={genders[0]}
                />
              )}
              <Image
                src="/assest/PDP_FREE_SHIPPING.webp"
                alt="Cash on delivery · Free shipping on all orders · Easy returns"
                width={480}
                height={120}
                className="w-full h-auto border border-gray-200 rounded-lg mt-2"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
