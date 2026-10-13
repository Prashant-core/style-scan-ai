"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Circle } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "upper", label: "One capital letter", test: (value) => /[A-Z]/.test(value) },
  { id: "lower", label: "One small letter", test: (value) => /[a-z]/.test(value) },
  { id: "number", label: "One number", test: (value) => /\d/.test(value) },
];

function validate(values) {
  const errors = {};
  if (values.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(values.username)) {
    errors.username = "Use 3 to 20 letters, numbers or underscores.";
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!PASSWORD_RULES.every((rule) => rule.test(values.password))) {
    errors.password = "Your password must meet all the rules below.";
  }
  if (values.confirm !== values.password) errors.confirm = "The passwords do not match.";
  if (!values.consent) errors.consent = "Please confirm to continue.";
  return errors;
}

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, register } = useAuth();

  const [values, setValues] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/home");
  }, [loading, user, router]);

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await register({
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      router.replace("/home");
    } catch (err) {
      // Show the message under the field it belongs to
      if (/email/i.test(err.message)) setErrors({ email: err.message });
      else if (/username/i.test(err.message)) setErrors({ username: err.message });
      else setFormError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <title>Create account | StyleScan AI</title>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {formError}
          </div>
        )}

        <Input
          label="Full name"
          name="fullName"
          autoComplete="name"
          value={values.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />

        <Input
          label="Username"
          name="username"
          autoComplete="username"
          value={values.username}
          onChange={handleChange}
          error={errors.username}
          hint="Letters, numbers and underscores."
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />

        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5" aria-label="Password rules">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(values.password);
              return (
                <li
                  key={rule.id}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    met ? "text-success" : "text-muted"
                  }`}
                >
                  {met ? (
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Circle className="size-3 shrink-0" aria-hidden="true" />
                  )}
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <Input
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={handleChange}
          error={errors.confirm}
        />

        <div>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
            <input
              type="checkbox"
              name="consent"
              checked={values.consent}
              onChange={handleChange}
              className="mt-1 size-4 shrink-0 accent-ink"
            />
            <span>
              I understand my photos are stored privately and I can delete them whenever I want.
            </span>
          </label>
          {errors.consent && <p className="mt-1.5 text-sm text-danger">{errors.consent}</p>}
        </div>

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}