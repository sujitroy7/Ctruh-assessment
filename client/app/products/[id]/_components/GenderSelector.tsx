"use client";

import { useQueryState, parseAsString } from "nuqs";
import clsx from "clsx";

interface GenderSelectorProps {
  genders: string[];
  defaultGender: string;
}

export default function GenderSelector({ genders, defaultGender }: GenderSelectorProps) {
  const [selectedGender, setSelectedGender] = useQueryState(
    "gender",
    parseAsString.withDefault(defaultGender),
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {genders.map((g) => (
        <button
          key={g}
          type="button"
          aria-pressed={selectedGender === g}
          onClick={() => setSelectedGender(g)}
          className={clsx(
            "px-3 py-1 rounded-md text-sm font-medium transition-all capitalize",
            selectedGender === g
              ? "bg-ink text-ink-inverse"
              : "bg-neutral-100 text-ink-muted hover:bg-neutral-200",
          )}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
