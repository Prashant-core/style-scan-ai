"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import UploadBox from "@/components/features/UploadBox";
import MetricCard from "@/components/features/MetricCard";
import FaceOverlay from "@/components/features/FaceOverlay";
import { ApiError, api } from "@/utils/api";
import { FaceError, analyseFaces, detectFaces, readPhoto } from "@/utils/faceMeasure";

const TIPS = [
  "Look towards the camera. A small tilt is fine.",
  "Use soft, even light on your face.",
  "Pull your hair back from your forehead.",
  "Take off glasses and hats.",
  "Keep a relaxed face and your mouth closed.",
];

function StyleList({ title, items }) {
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <ul className="mt-3 border-t border-ink">
        {items.map((item) => (
          <li key={item.name} className="border-b border-line py-3">
            <p className="font-semibold">{item.name}</p>
            <p className="text-[15px] text-muted">{item.why}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FaceAnalysisPage() {
  const [phase, setPhase] = useState("idle"); // idle, working or done
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState(null);
  const [lines, setLines] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [photo, setPhoto] = useState(null); // { url, aspect }
  const [deleting, setDeleting] = useState(false);

  // Keeps track of the photo link so we can free it when we are done
  const photoUrl = useRef(null);

  function releasePhoto() {
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
    photoUrl.current = null;
  }

  useEffect(() => releasePhoto, []);

  function reset() {
    releasePhoto();
    setPhoto(null);
    setResult(null);
    setLines([]);
    setWarnings([]);
    setStatus("");
    setPhase("idle");
  }

  async function handleSelect(file) {
    setError("");
    setNotice("");
    setPhase("working");

    try {
      setStatus("Opening your photo...");
      const original = await readPhoto(file);

      setStatus("Loading the face model. The first time can take a few seconds...");
      // "canvas" is the photo turned upright if it was saved sideways
      const { faces, canvas } = await detectFaces(original);

      setStatus("Measuring your face...");
      const measured = analyseFaces(faces, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob) throw new FaceError("We couldn't show your photo. Please try again.");

      setStatus("Saving your result...");
      const saved = await api.post("/api/analysis/scans", { ratios: measured.ratios });

      releasePhoto();
      photoUrl.current = URL.createObjectURL(blob);
      setPhoto({ url: photoUrl.current, aspect: canvas.width / canvas.height });
      setLines(measured.lines);
      setWarnings(measured.warnings);
      setResult(saved);
      setPhase("done");
    } catch (err) {
      setError(
        err instanceof FaceError || err instanceof ApiError
          ? err.message
          : "Something went wrong while checking the photo. Please try another one."
      );
      setPhase("idle");
    }
  }

  async function handleDelete() {
    if (!result) return;
    setDeleting(true);
    try {
      await api.delete(`/api/analysis/scans/${result.id}`);
      reset();
      setNotice("Your result was deleted.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't delete this result. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <title>Face analysis | StyleScan AI</title>
      <AppShell
        title="Face analysis"
        description="Add one photo to find your face shape and the styles that suit it."
      >
        {phase !== "done" && (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
                >
                  {error}
                </div>
              )}
              {notice && (
                <p role="status" className="mb-5 rounded-lg border border-line bg-surface px-4 py-3 text-sm">
                  {notice}
                </p>
              )}

              {phase === "working" ? (
                <Card className="flex flex-col items-center py-16 text-center">
                  <Loader2 className="size-10 animate-spin text-ink" aria-hidden="true" />
                  <p className="mt-5 font-display text-3xl font-semibold tracking-tight">
                    Checking your photo
                  </p>
                  <p className="mt-2 max-w-sm text-muted" role="status" aria-live="polite">
                    {status}
                  </p>
                </Card>
              ) : (
                <UploadBox onSelect={handleSelect} />
              )}
            </div>

            <aside>
              <Card>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  For the best result
                </h2>
                <ul className="mt-4 space-y-2.5 text-[15px]">
                  {TIPS.map((tip) => (
                    <li key={tip} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-tape" aria-hidden="true" />
                      {tip}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 flex gap-2 border-t border-line pt-5 text-sm text-muted">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden="true" />
                  Your photo stays on your device. Only the measurements are saved to your account.
                </p>
              </Card>
            </aside>
          </div>
        )}

        {phase === "done" && result && photo && (
          <div className="space-y-14">
            <section className="grid items-start gap-8 lg:grid-cols-[320px_1fr] lg:gap-12">
              <Reveal onLoad>
                <FaceOverlay src={photo.url} lines={lines} aspect={photo.aspect} />
              </Reveal>

              <Reveal onLoad delay={0.1}>
                <p className="text-sm text-muted">Your face shape</p>
                <h2 className="mt-1 font-display text-6xl font-semibold leading-none tracking-tight">
                  {result.advice.title}
                </h2>
                {result.runner_up_title && (
                  <p className="mt-3 inline-block rounded-full bg-tape/25 px-3 py-1 text-sm font-medium">
                    You are close to a {result.runner_up_title.toLowerCase()} too
                  </p>
                )}
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{result.advice.summary}</p>
                {result.matches?.length > 0 && (
                  <div className="mt-6 max-w-xl">
                    <p className="text-sm text-muted">How closely you match each shape</p>
                    <ul className="mt-2 space-y-2">
                      {result.matches.map((match) => (
                        <li key={match.shape} className="flex items-center gap-3 text-sm">
                          <span className="w-24 shrink-0 font-medium">{match.title.replace(" face", "")}</span>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                            <span
                              className="block h-full rounded-full bg-tape"
                              style={{ width: `${match.percent}%` }}
                            />
                          </span>
                          <span className="w-10 text-right tabular-nums">{match.percent}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {warnings.length > 0 && (
                  <ul className="mt-5 max-w-xl space-y-1 rounded-lg border border-tape bg-tape/15 px-4 py-3 text-sm">
                    {warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                )}
              </Reveal>
            </section>

            <section>
              <h2 className="font-display text-4xl font-semibold leading-none tracking-tight">
                Your measurements
              </h2>
              <p className="mt-3 max-w-xl text-muted">
                Each number is compared with the width of your cheekbones, which is always 1.00. The
                dark mark on each bar shows 1.00.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Cheekbones" value={1} hint="Your starting point." />
                <MetricCard
                  label="Forehead"
                  value={result.ratios.forehead}
                  hint="Width across the top of your face."
                  delay={0.1}
                />
                <MetricCard
                  label="Jaw"
                  value={result.ratios.jaw}
                  hint="Width across your lower face."
                  delay={0.2}
                />
                <MetricCard
                  label="Face length"
                  value={result.ratios.length}
                  hint="Height from forehead to chin."
                  delay={0.3}
                />
              </div>
            </section>

            <section>
              <h2 className="font-display text-4xl font-semibold leading-none tracking-tight">
                Styles that suit you
              </h2>
              <div className="mt-8 grid gap-10 md:grid-cols-3">
                <StyleList title="Haircuts" items={result.advice.haircuts} />
                <StyleList title="Beards" items={result.advice.beards} />
                <StyleList title="Glasses" items={result.advice.glasses} />
              </div>

              <div className="mt-10 rounded-xl border border-line bg-surface p-6">
                <h3 className="font-display text-2xl font-semibold tracking-tight">Go easy on</h3>
                <ul className="mt-3 space-y-2 text-[15px]">
                  {result.advice.avoid.map((tip) => (
                    <li key={tip} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-6 max-w-2xl text-sm text-muted">
                These are ideas, not rules. Your face shape is estimated from a flat photo, so use it
                as a starting point and trust what you like.
              </p>
            </section>

            <section className="flex flex-wrap items-center gap-3 border-t border-line pt-8">
              <Button onClick={reset} variant="secondary">
                Check another photo
              </Button>
              <Button onClick={handleDelete} variant="ghost" loading={deleting}>
                Delete this result
              </Button>
              {error && (
                <p role="alert" className="text-sm text-danger">
                  {error}
                </p>
              )}
            </section>
          </div>
        )}
      </AppShell>
    </>
  );
}