import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#EF2B4D] text-white hover:bg-[#D81E40] shadow-sm disabled:bg-gray-300 disabled:text-gray-500",
  secondary: "bg-[#F4F5F7] text-[#1F1F1F] hover:bg-gray-200 border border-gray-200",
  outline:
    "bg-white text-[#1F1F1F] border border-gray-300 hover:border-[#EF2B4D] hover:text-[#EF2B4D]",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300",
  ghost: "text-gray-700 hover:bg-[#F4F5F7] hover:text-[#1F1F1F]",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#EF2B4D] focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {loading ? "Please wait…" : children}
    </button>
  );
}
