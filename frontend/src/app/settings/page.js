"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { friendlyError } from "@/utils/photo";

function megabytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Section({ title, description, children }) {
  return (
    <section className="grid gap-6 border-t border-ink py-10 lg:grid-cols-[260px_1fr] lg:gap-12">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-none tracking-tight">{title}</h2>
        {description && <p className="mt-3 text-muted">{description}</p>}
      </div>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

function ProfileForm() {
  const { user, updateName } = useAuth();
  const [name, setName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateName(name);
      setMessage({ type: "success", text: "Your name was saved." });
    } catch (err) {
      setMessage({ type: "error", text: friendlyError(err, "We couldn't save your name.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
      <p className="text-sm text-muted">
        Username: @{user?.username} &middot; Email: {user?.email}
      </p>
      {message && <Alert type={message.type}>{message.text}</Alert>}
      <Button type="submit" loading={saving} disabled={name.trim().length < 2}>
        Save name
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.patch("/api/users/me/password", { current_password: current, new_password: next });
      setCurrent("");
      setNext("");
      setMessage({ type: "success", text: "Your password was changed." });
    } catch (err) {
      setMessage({ type: "error", text: friendlyError(err, "We couldn't change your password.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Current password"
        type="password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        autoComplete="current-password"
        required
      />
      <Input
        label="New password"
        type="password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        hint="At least 8 characters, with a capital letter, a small letter and a number."
        autoComplete="new-password"
        required
      />
      {message && <Alert type={message.type}>{message.text}</Alert>}
      <Button type="submit" loading={saving} disabled={!current || !next}>
        Change password
      </Button>
    </form>
  );
}

function DataControls() {
  const [summary, setSummary] = useState(null);
  const [confirm, setConfirm] = useState(null); // "photos" or "history"
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get("/api/users/me/summary")
      .then((data) => active && setSummary(data))
      .catch(() => active && setSummary(null));
    return () => {
      active = false;
    };
  }, []);

  async function run(kind) {
    setBusy(true);
    setMessage(null);
    try {
      await api.delete(kind === "photos" ? "/api/users/me/photos" : "/api/users/me/history");
      setConfirm(null);
      setMessage({ type: "success", text: kind === "photos" ? "All your photos were deleted." : "All your history was deleted." });
      setSummary(await api.get("/api/users/me/summary"));
    } catch (err) {
      setMessage({ type: "error", text: friendlyError(err, "We couldn't delete this. Try again.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        {summary ? (
          <p>
            You have <strong>{summary.photos}</strong> saved photo{summary.photos === 1 ? "" : "s"} (
            {megabytes(summary.photo_bytes)}) and <strong>{summary.records}</strong> saved result
            {summary.records === 1 ? "" : "s"}.
          </p>
        ) : (
          <p className="text-muted">Loading your saved data...</p>
        )}
        <p className="mt-2 text-sm text-muted">Your photos are private. Only you can see them.</p>
      </Card>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      {[
        { kind: "photos", label: "Delete all my photos", sure: "Delete all photos? This cannot be undone." },
        { kind: "history", label: "Delete all my history", sure: "Delete all results and photos? This cannot be undone." },
      ].map((item) => (
        <div key={item.kind}>
          {confirm === item.kind ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm">{item.sure}</p>
              <Button variant="danger" size="sm" loading={busy} onClick={() => run(item.kind)}>
                Yes, delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirm(item.kind)}>
              {item.label}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function DeleteAccount() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.delete("/api/users/me", { password });
      logout();
      window.location.replace("/"); // a full reload, so nothing from the old session is left
    } catch (err) {
      setError(friendlyError(err, "We couldn't delete your account."));
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <>
        <p className="mb-4 text-muted">
          This deletes your account, all your results and all your photos for good.
        </p>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Type your password to confirm"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      {error && <Alert>{error}</Alert>}
      <div className="flex gap-3">
        <Button type="submit" variant="danger" loading={busy} disabled={!password}>
          Delete everything
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  return (
    <>
      <title>Settings | StyleScan AI</title>
      <AppShell title="Settings" description="Manage your account and your private data.">
        <Section title="Profile" description="How your name shows in the app.">
          <ProfileForm />
        </Section>
        <Section title="Password" description="Use a password you do not use anywhere else.">
          <PasswordForm />
        </Section>
        <Section title="Your data" description="You are in control of what is saved.">
          <DataControls />
        </Section>
        <Section title="Delete account">
          <DeleteAccount />
        </Section>
      </AppShell>
    </>
  );
}