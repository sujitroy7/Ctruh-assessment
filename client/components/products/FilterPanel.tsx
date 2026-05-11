"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import Checkbox from "@/components/ui/Checkbox";
import RadioButton, { RadioGroup } from "@/components/ui/RadioButton";

export interface FilterValues {
  gender: string;
  color: string;
  type: string;
  priceMin: number;
  priceMax: number;
}

interface FilterPanelProps {
  genders: string[];
  colors: string[];
  types: string[];
  absoluteMin: number;
  absoluteMax: number;
  values: FilterValues;
  onChange: (next: FilterValues) => void;
  className?: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-ink tracking-wider uppercase mb-3">
      {children}
    </p>
  );
}

function Divider() {
  return <hr className="border-border my-4" />;
}

export default function FilterPanel({
  genders,
  colors,
  types,
  absoluteMin,
  absoluteMax,
  values,
  onChange,
  className,
}: FilterPanelProps) {
  const hasActiveFilters =
    values.gender !== "" ||
    values.color !== "" ||
    values.type !== "" ||
    values.priceMin !== absoluteMin ||
    values.priceMax !== absoluteMax;

  const set = (partial: Partial<FilterValues>) =>
    onChange({ ...values, ...partial });

  const clearAll = () =>
    onChange({
      gender: "",
      color: "",
      type: "",
      priceMin: absoluteMin,
      priceMax: absoluteMax,
    });

  const range = absoluteMax - absoluteMin || 1;
  const minPct = ((values.priceMin - absoluteMin) / range) * 100;
  const maxPct = ((values.priceMax - absoluteMin) / range) * 100;

  return (
    <div
      className={clsx(
        "bg-surface border border-border rounded-lg p-4",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-ink">Filters</p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Gender — radio (single select, always has a value) */}
      <SectionLabel>Gender</SectionLabel>
      <RadioGroup name="filter-gender" className="gap-2">
        <RadioButton
          label="All"
          value=""
          checked={values.gender === ""}
          onChange={() => set({ gender: "" })}
        />
        {genders.map((g) => (
          <RadioButton
            key={g}
            label={<span className="capitalize">{g}</span>}
            value={g}
            checked={values.gender === g}
            onChange={() => set({ gender: g })}
          />
        ))}
      </RadioGroup>

      <Divider />

      {/* Colour — single-select checkbox (click same to deselect) */}
      <SectionLabel>Colour</SectionLabel>
      <div className="flex flex-col gap-2">
        {colors.map((color) => (
          <Checkbox
            key={color}
            checked={values.color === color}
            onChange={() => set({ color: values.color === color ? "" : color })}
            label={
              <span className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-border shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{color}</span>
              </span>
            }
          />
        ))}
      </div>

      <Divider />

      {/* Price Range — dual-thumb slider */}
      <SectionLabel>Price Range</SectionLabel>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-xs font-medium text-ink-soft">
          <span>${values.priceMin.toFixed(2)}</span>
          <span>${values.priceMax.toFixed(2)}</span>
        </div>
        <div className="relative h-5">
          {/* Track */}
          <div className="absolute top-1/2 -translate-y-1/2 h-1.5 w-full rounded-full bg-neutral-200" />
          {/* Active fill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-primary-600"
            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          />
          {/* Min thumb */}
          <input
            type="range"
            min={absoluteMin}
            max={absoluteMax}
            step={0.25}
            value={values.priceMin}
            onChange={(e) => {
              const v = Math.min(
                Number(e.target.value),
                values.priceMax - 0.25,
              );
              set({ priceMin: parseFloat(v.toFixed(2)) });
            }}
            className="price-range-input"
            aria-label="Minimum price"
          />
          {/* Max thumb */}
          {/* Todo: implement throttle */}
          <input
            type="range"
            min={absoluteMin}
            max={absoluteMax}
            step={0.25}
            value={values.priceMax}
            onChange={(e) => {
              const v = Math.max(
                Number(e.target.value),
                values.priceMin + 0.25,
              );
              set({ priceMax: parseFloat(v.toFixed(2)) });
            }}
            className="price-range-input"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <Divider />

      {/* Type — single-select checkbox (click same to deselect) */}
      <SectionLabel>Type</SectionLabel>
      <div className="flex flex-col gap-2">
        {types.map((type) => (
          <Checkbox
            key={type}
            checked={values.type === type}
            onChange={() => set({ type: values.type === type ? "" : type })}
            label={<span className="capitalize">{type}</span>}
          />
        ))}
      </div>
    </div>
  );
}
