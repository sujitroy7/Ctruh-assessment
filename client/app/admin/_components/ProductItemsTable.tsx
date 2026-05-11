"use client";

export interface ProductItem {
  _id: string;
  gender: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
  is_deleted: boolean;
}

interface ProductItemsTableProps {
  items: ProductItem[];
}

export default function ProductItemsTable({ items }: ProductItemsTableProps) {
  const visibleItems = items.filter((item) => !item.is_deleted);

  if (visibleItems.length === 0) {
    return (
      <tr>
        <td
          colSpan={6}
          className="px-6 py-4 text-center text-sm text-ink-muted bg-neutral-50"
        >
          No items found for this product.
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr>
        <td
          colSpan={6}
          className="px-0 py-0 bg-neutral-50 border-b border-border"
        >
          <div className="ml-10 border-l border-gray-200">
            <table className="w-full text-sm border border-border rounded-md overflow-hidden">
              <thead>
                <tr className="bg-neutral-100 text-left">
                  <th className="px-4 py-2 font-medium text-ink-muted">
                    Gender
                  </th>
                  <th className="px-4 py-2 font-medium text-ink-muted">
                    Color
                  </th>
                  <th className="px-4 py-2 font-medium text-ink-muted">
                    Price
                  </th>
                  <th className="px-4 py-2 font-medium text-ink-muted">
                    Stock
                  </th>
                  <th className="px-4 py-2 font-medium text-ink-muted">
                    Images
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-surface" : "bg-neutral-50"}
                  >
                    <td className="px-4 py-2 text-ink-soft capitalize">
                      {item.gender}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-border shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-ink-soft capitalize">
                          {item.color}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2 text-ink font-medium">
                      ₹{item.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          item.stock === 0
                            ? "text-error-600 font-medium"
                            : item.stock <= 5
                              ? "text-warning-600 font-medium"
                              : "text-success-600 font-medium"
                        }
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-ink-muted">
                      {item.images.length} image(s)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    </>
  );
}
