"use client";

import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(function Input(
  { label, error, hint, type = "text", className = "", ...props },
  ref,
) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const messageId = `${id}-message`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={`h-11 w-full rounded-lg border bg-surface px-4 text-[15px] text-ink placeholder:text-muted/60 transition focus:outline-none focus:ring-4 ${
            error
              ? "border-danger focus:ring-danger/15"
              : "border-line hover:border-ink/30 focus:border-ink focus:ring-tape/50"
          } ${isPassword ? "pr-12" : ""}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted transition-colors hover:text-ink"
          >
            {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        )}
      </div>

      {error ? (
        <p id={messageId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;