"use client";

import { useQueryState, parseAsString } from "nuqs";
import clsx from "clsx";

interface ColorSelectorProps {
  colors: string[];
  defaultColor: string;
}

export default function ColorSelector({ colors, defaultColor }: ColorSelectorProps) {
  const [selectedColor, setSelectedColor] = useQueryState(
    "color",
    parseAsString.withDefault(defaultColor),
  );

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          title={color}
          aria-label={`Select color ${color}`}
          aria-pressed={selectedColor === color}
          onClick={() => setSelectedColor(color)}
          className={clsx(
            "w-9 h-9 rounded-md border-2 transition-all active:scale-95",
            selectedColor === color
              ? "border-ink ring-2 ring-offset-2 ring-ink"
              : "border-border hover:border-ink-muted",
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
