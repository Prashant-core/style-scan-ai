import Link from "next/link";
import { Loader2 } from "lucide-react";

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
};

// Flat colours. On hover a button rises 1px and fades a little. Pressing it shrinks it slightly.
const variants = {
  primary: "bg-ink text-paper hover:-translate-y-px hover:opacity-90",
  secondary: "border border-line text-ink hover:-translate-y-px hover:border-ink",
  light: "bg-paper text-ink hover:-translate-y-px hover:opacity-90",
  danger: "bg-danger text-paper hover:-translate-y-px hover:opacity-90",
  ghost: "text-ink hover:bg-ink/5",
};

export default function Button({
  href,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...props
}) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-200 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      <span className="inline-flex items-center justify-center gap-2">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled || loading} className={classes} {...props}>
      {content}
    </button>
  );
}