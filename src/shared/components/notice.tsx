interface NoticeProps {
  children: string;
  variant?: "error" | "success" | "info";
}

const styles = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-line bg-sage text-forest-dark",
};

export function Notice({ children, variant = "info" }: NoticeProps) {
  return (
    <p role={variant === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}>
      {children}
    </p>
  );
}
