import { notFound } from "next/navigation";
import ProductForm from "./_components/ProductForm";
import { getProductById, getProductTypes } from "@/lib/api/products";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const productTypesRes = await getProductTypes();
  const productTypes = productTypesRes.success ? productTypesRes.data : [];

  if (id === "new") {
    return (
      <ProductForm
        formType="update"
        productTypes={productTypes}
        initialData={{
          _id: id,
          name: "",
          type: "",
          items: [],
        }}
      />
    );
  }

  const productDetailsRes = await getProductById(id);

  if (!productDetailsRes.success) notFound();

  return (
    <ProductForm
      formType="update"
      productTypes={productTypes}
      initialData={{
        _id: id,
        name: productDetailsRes.data.name,
        type: productDetailsRes.data.type.id,
        items: productDetailsRes.data.items.map((item) => ({
          ...item,
          images: item.images ?? [],
        })),
      }}
    />
  );
}

// const tes2 = test.data
// const typesRes = await fetch(`${backendUrl}/products/types`, {
//   cache: "no-store",
// });
// const productTypes: ProductType[] = typesRes.ok ? await typesRes.json() : [];
