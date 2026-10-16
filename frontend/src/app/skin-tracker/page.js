"use client";

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import UploadBox from "@/components/features/UploadBox";
import PrivateImage from "@/components/features/PrivateImage";
import ScoreBar from "@/components/features/ScoreBar";
import TrendChart from "@/components/features/TrendChart";
import { api } from "@/utils/api";
import { formatDate, friendlyError, prepareUpload } from "@/utils/photo";

const PARTS = [
  { key: "clarity", label: "Clarity", hint: "Few spots or marks" },
  { key: "evenness", label: "Evenness", hint: "Even skin tone" },
  { key: "smoothness", label: "Smoothness", hint: "Smooth texture" },
  { key: "calm", label: "Calm", hint: "Little redness" },
  { key: "glow", label: "Glow", hint: "Fresh, healthy look" },
];

function Change({ scans }) {
  if (scans.length < 2) return null;
  const now = scans[scans.length - 1].metrics.overall;
  const before = scans[scans.length - 2].metrics.overall;
  const diff = now - before;
  const Icon = diff >= 0 ? TrendingUp : TrendingDown;

  return (
    <p className="mt-4 flex items-center gap-2 text-[15px]">
      <Icon className="size-5" aria-hidden="true" />
      {diff === 0
        ? "Same as your last scan."
        : `${Math.abs(diff)} point${Math.abs(diff) === 1 ? "" : "s"} ${diff > 0 ? "higher" : "lower"} than your last scan.`}
    </p>
  );
}

export default function SkinTrackerPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [latest, setLatest] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/api/skin/scans")
      .then((data) => active && setScans(data))
      .catch((err) => active && setError(friendlyError(err, "We couldn't load your scans.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function handleSelect(selected) {
    setError("");
    setNotice("");
    setWorking(true);
    try {
      const form = new FormData();
      form.append("photo", await prepareUpload(selected));
      form.append("note", note.trim());
      const created = await api.post("/api/skin/scans", form);
      setLatest(created);
      setScans((current) => [...current, created]);
      setNote("");
    } catch (err) {
      setError(friendlyError(err, "Something went wrong. Please try again."));
    } finally {
      setWorking(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/api/history/${id}`);
      setScans((current) => current.filter((scan) => scan.id !== id));
      if (latest?.id === id) setLatest(null);
      setNotice("That scan was deleted.");
    } catch (err) {
      setError(friendlyError(err, "We couldn't delete this scan. Try again."));
    }
  }

  const points = scans.map((scan) => ({ date: scan.created_at, value: scan.metrics.overall }));
  const data = latest?.metrics;

  return (
    <>
      <title>Skin tracker | StyleScan AI</title>
      <AppShell
        title="Skin tracker"
        description="Scan your skin once a day and watch the graph to see if your routine is working."
      >
        {error && <Alert className="mb-6">{error}</Alert>}
        {notice && <Alert type="notice" className="mb-6">{notice}</Alert>}

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            {working ? (
              <Card className="py-16 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">Checking your skin</p>
                <p className="mt-2 text-muted">This takes a few seconds.</p>
              </Card>
            ) : (
              <>
                <div className="mb-4">
                  <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
                    Note for today (optional)
                  </label>
                  <input
                    id="note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={200}
                    placeholder="For example: new face wash, slept badly"
                    className="h-11 w-full rounded-lg border border-line bg-surface px-4 text-[15px] focus:border-ink focus:outline-none focus:ring-4 focus:ring-tape/50"
                  />
                </div>
                <UploadBox onSelect={handleSelect} />
              </>
            )}
            <p className="mt-4 text-sm text-muted">
              For fair results, scan at the same time each day, in the same light, without makeup. This is a
              wellness helper, not a medical test.
            </p>
          </div>

          <div>
            {data ? (
              <Reveal onLoad>
                <p className="text-sm text-muted">Today&apos;s skin score</p>
                <p className="font-display text-7xl font-semibold leading-none tracking-tight">
                  {data.overall}
                  <span className="text-3xl text-muted"> / 100</span>
                </p>
                <Change scans={scans} />
                <p className="mt-4 text-muted">{data.summary}</p>
                <div className="mt-6 space-y-5">
                  {PARTS.map((part, index) => (
                    <ScoreBar key={part.key} label={part.label} value={data[part.key]} hint={part.hint} delay={index * 0.08} />
                  ))}
                </div>
                {data.tips?.length > 0 && (
                  <ul className="mt-6 space-y-2 border-t border-line pt-5 text-[15px]">
                    {data.tips.map((tip) => (
                      <li key={tip} className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-tape" aria-hidden="true" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ) : (
              <Card className="text-muted">Your result will show here after your first scan.</Card>
            )}
          </div>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-4xl font-semibold leading-none tracking-tight">Your progress</h2>
          {loading ? (
            <div className="mt-6 h-48 animate-pulse rounded-xl bg-line" aria-hidden="true" />
          ) : scans.length === 0 ? (
            <p className="mt-4 text-muted">No scans yet. Your graph will appear after your first scan.</p>
          ) : (
            <>
              <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-ink">
                <TrendChart points={points} />
              </div>

              <h3 className="mt-10 font-display text-2xl font-semibold tracking-tight">Past scans</h3>
              <ul className="mt-3 border-t border-ink">
                {[...scans].reverse().map((scan) => (
                  <li key={scan.id} className="flex items-center gap-4 border-b border-line py-4">
                    {scan.image_id && (
                      <PrivateImage
                        imageId={scan.image_id}
                        alt="Skin scan photo"
                        className="size-16 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {scan.metrics.overall} / 100
                        <span className="ml-3 text-sm font-normal text-muted">{formatDate(scan.created_at, true)}</span>
                      </p>
                      {scan.metrics.note && <p className="truncate text-sm text-muted">{scan.metrics.note}</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(scan.id)}>
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </AppShell>
    </>
  );
}