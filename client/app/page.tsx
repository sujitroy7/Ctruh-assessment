"use client";

import { useState } from "react";
import { useQueryStates, parseAsString, parseAsFloat } from "nuqs";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts, getFilters } from "@/lib/api/products";
import { FilterValues } from "@/components/products/FilterPanel";
import SearchBar from "@/components/products/SearchBar";
import MobileFilterToggle from "@/components/products/MobileFilterToggle";
import FilterSidebar from "@/components/products/FilterSidebar";
import ProductGrid from "@/components/products/ProductGrid";

export default function SearchPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [{ q, gender, color, type, priceMin, priceMax }, setParams] =
    useQueryStates({
      q: parseAsString.withDefault(""),
      gender: parseAsString.withDefault(""),
      color: parseAsString.withDefault(""),
      type: parseAsString.withDefault(""),
      priceMin: parseAsFloat,
      priceMax: parseAsFloat,
    });

  const { data: filterOptions } = useQuery({
    queryKey: ["product-filters"],
    queryFn: async () => {
      const result = await getFilters();
      if (!result.success) return null;
      return result.data;
    },
  });

  const resolvedPriceMin = priceMin ?? filterOptions?.min_price;
  const resolvedPriceMax = priceMax ?? filterOptions?.max_price;
  const filters: FilterValues = {
    gender,
    color,
    type,
    priceMin: resolvedPriceMin ?? 0,
    priceMax: resolvedPriceMax ?? 0,
  };

  const { data: products = [] } = useQuery({
    queryKey: [q, gender, color, type, resolvedPriceMin, resolvedPriceMax],
    initialData: [],
    queryFn: async () => {
      const result = await getAllProducts({
        search: q,
        gender,
        color,
        type,
        min_price: resolvedPriceMin,
        max_price: resolvedPriceMax,
      });
      if (!result.success) return [];
      return result.data.data;
    },
  });

  const activeFilterCount = [
    filters.gender,
    filters.color,
    filters.type,
    priceMin !== null || priceMax !== null ? "price" : "",
  ].filter(Boolean).length;

  const handleSearch = (searchValue: string) => setParams({ q: searchValue });

  const handleSetFilters = (next: FilterValues) =>
    setParams({
      gender: next.gender,
      color: next.color,
      type: next.type,
      priceMin: next.priceMin !== filterOptions?.min_price ? next.priceMin : null,
      priceMax: next.priceMax !== filterOptions?.max_price ? next.priceMax : null,
    });

  const handleClearFilters = () =>
    setParams({ gender: "", color: "", type: "", priceMin: null, priceMax: null });

  return (
    <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6 mb-6">
      <SearchBar defaultValue={q} onSearch={handleSearch} />

      <MobileFilterToggle
        isOpen={mobileFiltersOpen}
        onToggle={() => setMobileFiltersOpen((v) => !v)}
        activeFilterCount={activeFilterCount}
        productCount={products.length}
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <FilterSidebar
          isOpen={mobileFiltersOpen}
          filters={filters}
          onChange={handleSetFilters}
          filterOptions={filterOptions}
        />

        <ProductGrid
          products={products}
          q={q}
          activeFilterCount={activeFilterCount}
          onClearFilters={handleClearFilters}
          onClearSearch={() => setParams({ q: "" })}
        />
      </div>
    </div>
  );
}
