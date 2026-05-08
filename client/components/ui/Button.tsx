import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
}

export default function Button({
  children,
  loading = false,
  variant = "primary",
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && [
          "bg-blue-600 text-white",
          "hover:bg-blue-700 active:bg-blue-800",
        ],
        variant === "ghost" && [
          "bg-transparent text-gray-600 border border-gray-300",
          "hover:bg-gray-50 active:bg-gray-100",
        ],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
          Please wait...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
