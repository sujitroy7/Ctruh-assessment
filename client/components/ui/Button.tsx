import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode, cloneElement, isValidElement } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
  fullWidth?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: clsx(
    "bg-primary-600 text-ink-inverse border-transparent",
    "hover:bg-primary-700 active:bg-primary-800",
    "focus:ring-primary-500",
  ),
  secondary: clsx(
    "bg-surface text-ink-soft border-border",
    "hover:bg-neutral-50 active:bg-neutral-100",
    "focus:ring-neutral-400",
  ),
  danger: clsx(
    "bg-error-600 text-ink-inverse border-transparent",
    "hover:bg-error-700 active:bg-error-800",
    "focus:ring-error-500",
  ),
  ghost: clsx(
    "bg-transparent text-ink-soft border-transparent",
    "hover:bg-neutral-100 active:bg-neutral-200",
    "focus:ring-neutral-400",
  ),
  link: clsx(
    "bg-transparent text-primary-600 border-transparent underline-offset-4",
    "hover:underline active:text-primary-800",
    "focus:ring-primary-500",
    "px-0 py-0 rounded-none h-auto",
  ),
};

const sizeStyles: Record<ButtonSize, { base: string; icon: string }> = {
  sm: { base: "px-3 py-1.5 text-xs gap-1.5", icon: "w-3.5 h-3.5" },
  md: { base: "px-4 py-2.5 text-sm gap-2",   icon: "w-4 h-4"     },
  lg: { base: "px-6 py-3 text-base gap-2.5",  icon: "w-5 h-5"     },
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  sm: "p-1.5",
  md: "p-2.5",
  lg: "p-3",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  loadingText = "Please wait…",
  leftIcon,
  rightIcon,
  iconOnly = false,
  fullWidth = false,
  disabled,
  className,
  href,
  target,
  rel,
  ...props
}: ButtonProps) {
  const { base, icon: iconSize } = sizeStyles[size];
  const isDisabled = disabled || loading;

  const resolvedClassName = clsx(
    "inline-flex items-center justify-center",
    "rounded-md border font-medium transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    !href && "disabled:opacity-50 disabled:cursor-not-allowed",
    variantStyles[variant],
    iconOnly ? iconOnlySizeStyles[size] : base,
    fullWidth && "w-full",
    className,
  );

  const content = loading ? (
    <>
      <Loader2 className={clsx("animate-spin shrink-0", iconSize)} />
      {!iconOnly && <span>{loadingText}</span>}
    </>
  ) : (
    <>
      {leftIcon && isValidElement(leftIcon) &&
        cloneElement(leftIcon as React.ReactElement<{ className?: string }>, {
          className: clsx("shrink-0", iconSize, (leftIcon.props as { className?: string }).className),
        })}
      {children}
      {rightIcon && isValidElement(rightIcon) &&
        cloneElement(rightIcon as React.ReactElement<{ className?: string }>, {
          className: clsx("shrink-0", iconSize, (rightIcon.props as { className?: string }).className),
        })}
    </>
  );

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={resolvedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button
      disabled={isDisabled}
      className={resolvedClassName}
      {...props}
    >
      {content}
    </button>
  );
}
