"use client";

import { useState } from "react";
import { useQueryStates, parseAsString, parseAsFloat } from "nuqs";
import Input from "@/components/ui/Input";
import ProductCard from "@/components/products/ProductCard";
import FilterPanel, { FilterValues } from "@/components/products/FilterPanel";
import { Search, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";

const allProducts = [
  {
    id: "1",
    name: "Toddler Staple Tee | Bella + Canvas 3001T",
    badge: "Bestseller",
    is_deleted: false,
    items: [
      {
        id: "1a",
        gender: "unisex",
        type: "tee",
        color: "black",
        price: 12.75,
        stock: 10,
        images: ["/product/tshirt-1.jpg"],
        is_deleted: false,
      },
      {
        id: "1b",
        gender: "unisex",
        type: "tee",
        color: "blue",
        price: 12.75,
        stock: 8,
        images: [],
        is_deleted: false,
      },
      {
        id: "1c",
        gender: "unisex",
        type: "tee",
        color: "pink",
        price: 14.0,
        stock: 5,
        images: [],
        is_deleted: false,
      },
      {
        id: "1d",
        gender: "unisex",
        type: "tee",
        color: "white",
        price: 12.75,
        stock: 12,
        images: [],
        is_deleted: false,
      },
    ],
  },
  {
    id: "2",
    name: "Classic Polo | Men's Essential",
    is_deleted: false,
    items: [
      {
        id: "2a",
        gender: "male",
        type: "polo",
        color: "navy",
        price: 18.5,
        stock: 20,
        images: ["/product/tshirt-1.jpg"],
        is_deleted: false,
      },
      {
        id: "2b",
        gender: "male",
        type: "polo",
        color: "white",
        price: 18.5,
        stock: 15,
        images: [],
        is_deleted: false,
      },
      {
        id: "2c",
        gender: "female",
        type: "polo",
        color: "pink",
        price: 18.5,
        stock: 9,
        images: [],
        is_deleted: false,
      },
    ],
  },
  {
    id: "3",
    name: "Oversized Drop-Shoulder Tee",
    is_deleted: false,
    items: [
      {
        id: "3a",
        gender: "male",
        type: "tee",
        color: "gray",
        price: 22.0,
        stock: 7,
        images: ["/product/tshirt-1.jpg"],
        is_deleted: false,
      },
      {
        id: "3b",
        gender: "female",
        type: "tee",
        color: "gray",
        price: 22.0,
        stock: 4,
        images: [],
        is_deleted: false,
      },
      {
        id: "3c",
        gender: "male",
        type: "tee",
        color: "black",
        price: 22.0,
        stock: 11,
        images: [],
        is_deleted: false,
      },
      {
        id: "3d",
        gender: "female",
        type: "tee",
        color: "black",
        price: 22.0,
        stock: 6,
        images: [],
        is_deleted: false,
      },
    ],
  },
  {
    id: "4",
    name: "Premium Cotton Crew Neck Sweatshirt",
    badge: "New",
    is_deleted: false,
    items: [
      {
        id: "4a",
        gender: "unisex",
        type: "sweatshirt",
        color: "beige",
        price: 34.99,
        stock: 18,
        images: ["/product/tshirt-1.jpg"],
        is_deleted: false,
      },
      {
        id: "4b",
        gender: "unisex",
        type: "sweatshirt",
        color: "brown",
        price: 34.99,
        stock: 10,
        images: [],
        is_deleted: false,
      },
    ],
  },
  {
    id: "5",
    name: "Slim Fit V-Neck Tee | Women's Collection",
    is_deleted: false,
    items: [
      {
        id: "5a",
        gender: "female",
        type: "tee",
        color: "white",
        price: 15.0,
        stock: 25,
        images: ["/product/tshirt-1.jpg"],
        is_deleted: false,
      },
      {
        id: "5b",
        gender: "female",
        type: "tee",
        color: "red",
        price: 15.0,
        stock: 14,
        images: [],
        is_deleted: false,
      },
      {
        id: "5c",
        gender: "female",
        type: "tee",
        color: "teal",
        price: 16.5,
        stock: 8,
        images: [],
        is_deleted: false,
      },
    ],
  },
  {
    id: "6",
    name: "Heavyweight Graphic Tee | 400 GSM",
    is_deleted: false,
    items: [
      {
        id: "6a",
        gender: "male",
        type: "tee",
        color: "black",
        price: 28.0,
        stock: 30,
        images: ["/product/tshirt-1.jpg"],
        is_deleted: false,
      },
      {
        id: "6b",
        gender: "male",
        type: "tee",
        color: "olive",
        price: 28.0,
        stock: 12,
        images: [],
        is_deleted: false,
      },
      {
        id: "6c",
        gender: "female",
        type: "tee",
        color: "black",
        price: 28.0,
        stock: 9,
        images: [],
        is_deleted: false,
      },
    ],
  },
];

// Derive filter options from data once
const allActiveItems = allProducts.flatMap((p) =>
  p.items.filter((i) => !i.is_deleted),
);
const filterGenders = [
  ...new Set(allActiveItems.map((i) => i.gender.toLowerCase())),
].sort();
const filterColors = [
  ...new Set(allActiveItems.map((i) => i.color.toLowerCase())),
].sort();
const filterTypes = [
  ...new Set(allActiveItems.map((i) => i.type.toLowerCase())),
].sort();
const absoluteMin = Math.floor(Math.min(...allActiveItems.map((i) => i.price)));
const absoluteMax = Math.ceil(Math.max(...allActiveItems.map((i) => i.price)));

const defaultFilters: FilterValues = {
  gender: "",
  color: "",
  type: "",
  priceMin: absoluteMin,
  priceMax: absoluteMax,
};

export default function SearchPage() {
  const [{ q, gender, color, type, priceMin, priceMax }, setParams] =
    useQueryStates({
      q: parseAsString.withDefault(""),
      gender: parseAsString.withDefault(""),
      color: parseAsString.withDefault(""),
      type: parseAsString.withDefault(""),
      priceMin: parseAsFloat.withDefault(absoluteMin),
      priceMax: parseAsFloat.withDefault(absoluteMax),
    });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters: FilterValues = { gender, color, type, priceMin, priceMax };

  const setFilters = (next: FilterValues) =>
    setParams({
      gender: next.gender,
      color: next.color,
      type: next.type,
      priceMin: next.priceMin,
      priceMax: next.priceMax,
    });

  const activeFilterCount = [
    filters.gender,
    filters.color,
    filters.type,
    filters.priceMin !== absoluteMin || filters.priceMax !== absoluteMax
      ? "price"
      : "",
  ].filter(Boolean).length;

  const filtered = allProducts.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    const activeItems = p.items.filter((i) => !i.is_deleted);
    return activeItems.some((item) => {
      if (filters.gender && item.gender !== filters.gender) return false;
      if (filters.color && item.color !== filters.color) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (item.price < filters.priceMin || item.price > filters.priceMax)
        return false;
      return true;
    });
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6 mb-6">
      {/* Search bar */}
      <div>
        <Input
          type="text"
          placeholder="Search by name..."
          value={q}
          onChange={(e) => setParams({ q: e.target.value })}
          leftIcon={<Search className="w-4 h-4" />}
          size="lg"
        />
      </div>

      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm font-medium text-ink-soft hover:bg-neutral-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-ink-inverse text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <p className="text-sm text-ink-muted">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Content: filter sidebar + product grid */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Filter panel */}
        <aside
          className={clsx(
            "w-full md:w-56 shrink-0 md:sticky md:top-20",
            mobileFiltersOpen ? "block" : "hidden md:block",
          )}
        >
          <FilterPanel
            genders={filterGenders}
            colors={filterColors}
            types={filterTypes}
            absoluteMin={absoluteMin}
            absoluteMax={absoluteMax}
            values={filters}
            onChange={setFilters}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <p className="hidden md:block text-sm text-ink-muted">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            {q && ` for "${q}"`}
          </p>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-ink-muted">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">No products match the selected filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
