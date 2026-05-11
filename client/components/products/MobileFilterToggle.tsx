"use client";

import { SlidersHorizontal } from "lucide-react";

interface MobileFilterToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  activeFilterCount: number;
  productCount: number;
}

export default function MobileFilterToggle({
  isOpen,
  onToggle,
  activeFilterCount,
  productCount,
}: MobileFilterToggleProps) {
  return (
    <div className="flex items-center justify-between md:hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
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
        {productCount} product{productCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
