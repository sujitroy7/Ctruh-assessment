"use client";

import {
  TextareaHTMLAttributes,
  forwardRef,
  useId,
  useState,
} from "react";
import clsx from "clsx";

type TextAreaSize = "sm" | "md" | "lg";
type TextAreaResize = "none" | "vertical" | "horizontal" | "both";

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  size?: TextAreaSize;
  resize?: TextAreaResize;
  showCount?: boolean;
  fullWidth?: boolean;
}

const sizeStyles: Record<TextAreaSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-3.5 py-2.5 text-sm",
  lg: "px-4 py-3 text-base",
};

const resizeStyles: Record<TextAreaResize, string> = {
  none:       "resize-none",
  vertical:   "resize-y",
  horizontal: "resize-x",
  both:       "resize",
};

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      hint,
      error,
      size = "md",
      resize = "vertical",
      showCount = false,
      fullWidth = true,
      rows = 4,
      id,
      value,
      defaultValue,
      onChange,
      maxLength,
      className,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const isControlled = value !== undefined;
    const [localValue, setLocalValue] = useState(String(defaultValue ?? ""));
    const currentCount = isControlled
      ? String(value ?? "").length
      : localValue.length;

    return (
      <div className={clsx("flex flex-col gap-1", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ink-soft"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          value={isControlled ? value : undefined}
          defaultValue={!isControlled ? defaultValue : undefined}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          onChange={(e) => {
            if (!isControlled) setLocalValue(e.target.value);
            onChange?.(e);
          }}
          className={clsx(
            "w-full rounded-md border outline-none transition-colors",
            "bg-surface text-ink placeholder:text-ink-muted",
            "focus:ring-2",
            "disabled:bg-neutral-50 disabled:text-ink-disabled disabled:cursor-not-allowed",
            sizeStyles[size],
            resizeStyles[resize],
            error
              ? "border-error-400 focus:border-error-500 focus:ring-error-100"
              : "border-border focus:border-primary-500 focus:ring-primary-100",
            className,
          )}
          {...props}
        />

        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
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

          {showCount && maxLength != null && (
            <p
              className={clsx(
                "text-xs shrink-0 tabular-nums",
                currentCount >= maxLength ? "text-error-500" : "text-ink-muted",
              )}
            >
              {currentCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
export default TextArea;
