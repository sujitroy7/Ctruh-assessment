import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          ref={ref}
          className={clsx(
            "w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors",
            "placeholder:text-gray-400",
            error
              ? "border-red-400 focus:border-red-500 bg-red-50"
              : "border-gray-300 focus:border-blue-500 bg-white",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
