"use client";

import clsx from "clsx";
import FilterPanel, { FilterValues } from "@/components/products/FilterPanel";

interface FilterOptions {
  genders: string[];
  colors: string[];
  types: string[];
  min_price: number;
  max_price: number;
}

interface Props {
  isOpen: boolean;
  filters: FilterValues;
  onChange: (next: FilterValues) => void;
  filterOptions: FilterOptions | null | undefined;
}

export default function FilterSidebar({
  isOpen,
  filters,
  onChange,
  filterOptions,
}: Props) {
  return (
    <aside
      className={clsx(
        "w-full md:w-56 shrink-0 md:sticky md:top-20",
        isOpen ? "block" : "hidden md:block",
      )}
    >
      {filterOptions && (
        <FilterPanel
          genders={filterOptions.genders}
          colors={filterOptions.colors}
          types={filterOptions.types}
          absoluteMin={filterOptions.min_price}
          absoluteMax={filterOptions.max_price}
          values={filters}
          onChange={onChange}
        />
      )}
    </aside>
  );
}
