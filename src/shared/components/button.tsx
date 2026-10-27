import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-forest text-white hover:bg-forest-dark",
  secondary: "border border-line bg-white text-foreground hover:bg-sage",
  ghost: "text-forest hover:bg-sage",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-55 ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}
