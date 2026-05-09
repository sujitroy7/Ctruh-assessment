"use client";

import {
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useId,
  useState,
} from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  size?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, { input: string; icon: string }> = {
  sm: { input: "px-3 py-1.5 text-xs",    icon: "w-3.5 h-3.5" },
  md: { input: "px-3.5 py-2.5 text-sm",  icon: "w-4 h-4"     },
  lg: { input: "px-4 py-3 text-base",    icon: "w-5 h-5"     },
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      size = "md",
      leftIcon,
      rightIcon,
      fullWidth = true,
      type = "text",
      id,
      className,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;
    const { input: inputPadding, icon: iconSize } = sizeStyles[size];

    const hasLeft = !!leftIcon;
    const hasRight = isPassword || !!rightIcon;

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

        <div className="relative flex items-center">
          {hasLeft && (
            <span className="absolute left-3 text-ink-muted pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={clsx(
              "w-full rounded-md border outline-none transition-colors",
              "bg-surface text-ink placeholder:text-ink-muted",
              "focus:ring-2",
              "disabled:bg-neutral-50 disabled:text-ink-disabled disabled:cursor-not-allowed",
              inputPadding,
              hasLeft && "pl-9",
              hasRight && "pr-10",
              error
                ? "border-error-400 focus:border-error-500 focus:ring-error-100"
                : "border-border focus:border-primary-500 focus:ring-primary-100",
              className,
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 text-ink-muted hover:text-ink-soft transition-colors"
            >
              {showPassword ? (
                <EyeOff className={iconSize} />
              ) : (
                <Eye className={iconSize} />
              )}
            </button>
          )}

          {!isPassword && hasRight && (
            <span className="absolute right-3 text-ink-muted pointer-events-none flex items-center">
              {rightIcon}
            </span>
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

Input.displayName = "Input";
export default Input;
