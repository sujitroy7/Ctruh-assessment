"use client";

import {
  InputHTMLAttributes,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useId,
} from "react";
import clsx from "clsx";

type RadioSize = "sm" | "md" | "lg";

// ─── Context ──────────────────────────────────────────────────────────────────

interface RadioGroupContextValue {
  name?: string;
  error?: string;
  size?: RadioSize;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({});

// ─── RadioGroup ───────────────────────────────────────────────────────────────

interface RadioGroupProps {
  label?: string;
  hint?: string;
  error?: string;
  name?: string;
  size?: RadioSize;
  children: ReactNode;
  className?: string;
}

export function RadioGroup({
  label,
  hint,
  error,
  name,
  size = "md",
  children,
  className,
}: RadioGroupProps) {
  const labelId = useId();

  return (
    <RadioGroupContext.Provider value={{ name, error, size }}>
      <div
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={
          error ? `${labelId}-error` : hint ? `${labelId}-hint` : undefined
        }
        aria-invalid={!!error}
        className={clsx("flex flex-col gap-3", className)}
      >
        {label && (
          <p id={labelId} className="text-sm font-medium text-ink-soft">
            {label}
          </p>
        )}

        {children}

        {error && (
          <p id={`${labelId}-error`} className="text-xs text-error-500">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${labelId}-hint`} className="text-xs text-ink-muted">
            {hint}
          </p>
        )}
      </div>
    </RadioGroupContext.Provider>
  );
}

// ─── RadioButton ──────────────────────────────────────────────────────────────

/*
 * Uses appearance-none + ring-inset to render the selection dot in pure CSS.
 * Dot size per size variant (total - 2*border - 2*ring):
 *   sm 14px — ring-[3px]: 14 - 4 - 6 = 4px dot
 *   md 16px — ring-[4px]: 16 - 4 - 8 = 4px dot
 *   lg 20px — ring-[5px]: 20 - 4 - 10 = 6px dot
 */
const sizeMap: Record<
  RadioSize,
  { size: string; ring: string; label: string; gap: string }
> = {
  sm: { size: "w-3.5 h-3.5", ring: "checked:ring-[3px]", label: "text-xs",  gap: "gap-1.5" },
  md: { size: "w-4 h-4",     ring: "checked:ring-[4px]", label: "text-sm",  gap: "gap-2"   },
  lg: { size: "w-5 h-5",     ring: "checked:ring-[5px]", label: "text-base", gap: "gap-2.5" },
};

interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: ReactNode;
  hint?: string;
  error?: string;
  size?: RadioSize;
}

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  (
    {
      label,
      hint,
      error: ownError,
      size: ownSize,
      name: ownName,
      disabled,
      id,
      className,
      ...props
    },
    ref,
  ) => {
    const ctx = useContext(RadioGroupContext);
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const size = ownSize ?? ctx.size ?? "md";
    const error = ownError ?? ctx.error;
    const name = ownName ?? ctx.name;

    const s = sizeMap[size];

    return (
      <div className="flex flex-col gap-1">
        <div className={clsx("flex items-center", s.gap)}>
          <input
            ref={ref}
            id={inputId}
            type="radio"
            name={name}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={clsx(
              "appearance-none shrink-0 rounded-full border-2 cursor-pointer transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "checked:ring-inset checked:ring-white",
              s.size,
              s.ring,
              disabled
                ? "border-border opacity-50 cursor-not-allowed"
                : error
                  ? clsx(
                      "border-error-400",
                      "checked:bg-error-600 checked:border-error-600",
                      "focus:ring-error-100",
                    )
                  : clsx(
                      "border-border",
                      "checked:bg-primary-600 checked:border-primary-600",
                      "focus:ring-primary-100",
                    ),
              className,
            )}
            {...props}
          />

          {label && (
            <label
              htmlFor={inputId}
              className={clsx(
                s.label,
                "font-medium leading-normal select-none",
                disabled
                  ? "text-ink-disabled cursor-not-allowed"
                  : "text-ink-soft cursor-pointer",
              )}
            >
              {label}
            </label>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-error-500">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-ink-muted">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

RadioButton.displayName = "RadioButton";
export default RadioButton;
