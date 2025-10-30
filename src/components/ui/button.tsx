
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  className = "",
  variant = "default",
  size = "md",
  children,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center transition-colors select-none focus:outline-none focus:ring-2 focus:ring-purple-500/40 disabled:opacity-50 disabled:pointer-events-none rounded-2xl";

  const variants = {
    default: "bg-purple-600 text-white hover:bg-purple-700",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900",
    ghost: "hover:bg-slate-100 text-slate-900",
  } as const;

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5",
    icon: "h-10 w-10",
  } as const;

  return (
    <button
      className={cx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
