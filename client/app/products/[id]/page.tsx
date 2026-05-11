import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProductById } from "@/lib/api/products";
import ColorSelector from "@/components/feature/product-details/ColorSelector";
import GenderSelector from "@/components/feature/product-details/GenderSelector";
import AddToCartButton from "@/components/feature/product-details/AddToCartButton";
import Button from "@/components/ui/Button";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, productRes] = await Promise.all([
    getServerSession(authOptions),
    getProductById(id),
  ]);

  if (!productRes.success) notFound();

  const product = productRes.data;
  // @ts-ignore
  const isOwner = session?.user?.role === "owner";

  const colors = [...new Set(product.items.map((i) => i.color.toLowerCase()))];
  const genders = [...new Set(product.items.map((i) => i.gender.toLowerCase()))];
  const minPrice =
    product.items.length > 0
      ? Math.min(...product.items.map((i) => i.price))
      : null;

  const image = product.items.find((i) => (i.images?.length ?? 0) > 0)?.images?.[0] ?? "";

  return (
    <div className="max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted mb-6 mt-4">
        <Link href="/" className="hover:text-ink-soft transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-ink-soft truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 items-start">
        {/* Image */}
        <div className="relative w-full aspect-square rounded-lg bg-neutral-100 border border-border overflow-hidden flex items-center justify-center">
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

        {/* Details */}
        <div className="flex flex-col gap-4 px-5 py-5">
          {/* Type badge */}
          {product.type?.title && (
            <span className="text-xs font-medium tracking-wide uppercase text-primary-600">
              {product.type.title}
            </span>
          )}

          {/* Name */}
          <h1 className="text-2xl font-bold leading-tight text-ink">{product.name}</h1>

          {/* Price */}
          {minPrice !== null && (
            <div>
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-0.5">
                From
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
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
                Color
              </p>
              <ColorSelector colors={colors} defaultColor={colors[0]} />
            </div>
          )}

          {/* Gender */}
          {genders.length > 0 && (
            <div>
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
                For
              </p>
              <GenderSelector genders={genders} defaultGender={genders[0]} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-2">
            {isOwner ? (
              <Button
                href={`/admin/products/${id}`}
                variant="secondary"
                fullWidth
                size="lg"
                leftIcon={<Pencil />}
              >
                Edit Product
              </Button>
            ) : (
              <AddToCartButton
                productId={product._id}
                productName={product.name}
                items={product.items}
                defaultColor={colors[0] ?? ""}
                defaultGender={genders[0] ?? ""}
              />
            )}

            <Image
              src="/assest/PDP_FREE_SHIPPING.webp"
              alt="Cash on delivery · Free shipping on all orders · Easy returns"
              width={480}
              height={120}
              className="w-full h-auto border border-border rounded-lg"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
