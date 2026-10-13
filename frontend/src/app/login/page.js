"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go straight to the app.
  useEffect(() => {
    if (!loading && user) router.replace("/home");
  }, [loading, user, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Enter your email or username and your password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      router.replace("/home");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-ink underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <title>Log in | StyleScan AI</title>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}

        <Input
          label="Email or username"
          name="identifier"
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}