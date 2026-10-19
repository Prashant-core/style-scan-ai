import Link from "next/link";
import { Loader2 } from "lucide-react";

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-[52px] px-8 text-base",
};

// On hover, a colored layer slides across the button (like pulling a tape measure).
const variants = {
  primary: "bg-ink text-white before:bg-tape hover:text-ink focus-visible:text-ink",
  secondary:
    "border border-ink/30 text-ink before:bg-ink hover:border-ink hover:text-white focus-visible:text-white",
  light: "bg-white text-ink before:bg-tape",
  danger: "bg-danger text-white before:bg-ink",
  ghost: "text-ink hover:bg-ink/5",
};

const sweep =
  "relative isolate overflow-hidden before:absolute before:inset-0 before:-z-10 before:-translate-x-full before:transition-transform before:duration-300 before:ease-out hover:before:translate-x-0 focus-visible:before:translate-x-0";

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
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
    variant === "ghost" ? "" : sweep,
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