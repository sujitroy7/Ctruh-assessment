import { notFound } from "next/navigation";
import ProductForm, {
  type ApiProduct,
  type ProductType,
} from "./_components/ProductForm";
import api from "@/lib/api";
import { getProductById, getProductTypes } from "@/lib/api/products";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  // const [productType] = await Promise.all([
  //   getProductTypes(),
  //   // getProductById(id),
  // ]);

  // console.log(await getProductTypes());

  // const productTypesRes = await getProductTypes();
  // const productTypes = productTypesRes.data;

  // if (id === "new") {
  //   return <ProductForm formType="create" productTypes={productTypes} />;
  // }

  // const productRes = await fetch(`${backendUrl}/products/${id}`, {
  //   cache: "no-store",
  // });

  // if (!productRes.ok) notFound();

  // const initialData: ApiProduct = await productRes.json();

  return <h1>Product Details Page</h1>;

  // return (
  //   <ProductForm
  //     formType="update"
  //     productTypes={productTypes}
  //     initialData={initialData}
  //   />
  // );
}

// const tes2 = test.data
// const typesRes = await fetch(`${backendUrl}/products/types`, {
//   cache: "no-store",
// });
// const productTypes: ProductType[] = typesRes.ok ? await typesRes.json() : [];
