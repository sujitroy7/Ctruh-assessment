"use client";

import {
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useId,
  useEffect,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import { Check, Minus } from "lucide-react";

type CheckboxSize = "sm" | "md" | "lg";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: ReactNode;
  hint?: string;
  error?: string;
  size?: CheckboxSize;
  indeterminate?: boolean;
}

const sizeMap: Record<CheckboxSize, { box: string; icon: string; label: string; gap: string }> = {
  sm: { box: "w-3.5 h-3.5", icon: "w-2.5 h-2.5", label: "text-xs",  gap: "gap-1.5" },
  md: { box: "w-4 h-4",     icon: "w-3 h-3",     label: "text-sm",  gap: "gap-2"   },
  lg: { box: "w-5 h-5",     icon: "w-3.5 h-3.5", label: "text-base", gap: "gap-2.5" },
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      hint,
      error,
      size = "md",
      indeterminate = false,
      checked,
      defaultChecked,
      onChange,
      disabled,
      id,
      className,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const internalRef = useRef<HTMLInputElement>(null);

    const setRef = (el: HTMLInputElement | null) => {
      (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    useEffect(() => {
      if (internalRef.current) internalRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const isControlled = checked !== undefined;
    const [localChecked, setLocalChecked] = useState(defaultChecked ?? false);
    const isChecked = isControlled ? !!checked : localChecked;
    const isActive = isChecked || indeterminate;

    const s = sizeMap[size];

    return (
      <div className="flex flex-col gap-1">
        <div className={clsx("flex items-center", s.gap)}>
          <div className="relative flex shrink-0">
            <input
              ref={setRef}
              id={inputId}
              type="checkbox"
              checked={isControlled ? checked : undefined}
              defaultChecked={!isControlled ? defaultChecked : undefined}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
              }
              onChange={(e) => {
                if (!isControlled) setLocalChecked(e.target.checked);
                onChange?.(e);
              }}
              className={clsx("peer sr-only", className)}
              {...props}
            />
            <span
              aria-hidden="true"
              className={clsx(
                "flex items-center justify-center shrink-0 rounded-sm border-2 transition-all",
                s.box,
                disabled
                  ? "bg-neutral-100 border-border opacity-50"
                  : error
                    ? isActive
                      ? "bg-error-600 border-error-600"
                      : "bg-surface border-error-400"
                    : isActive
                      ? "bg-primary-600 border-primary-600"
                      : "bg-surface border-border",
                !disabled &&
                  clsx(
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1",
                    error
                      ? "peer-focus-visible:ring-error-100"
                      : "peer-focus-visible:ring-primary-100",
                  ),
              )}
            >
              {indeterminate ? (
                <Minus className={clsx("text-ink-inverse", s.icon)} strokeWidth={3} />
              ) : isChecked ? (
                <Check className={clsx("text-ink-inverse", s.icon)} strokeWidth={3} />
              ) : null}
            </span>
          </div>

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

Checkbox.displayName = "Checkbox";
export default Checkbox;
