"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import UploadBox from "@/components/features/UploadBox";
import PrivateImage from "@/components/features/PrivateImage";
import ScoreBar from "@/components/features/ScoreBar";
import { api } from "@/utils/api";
import { friendlyError, prepareUpload } from "@/utils/photo";

const ATTIRE = [
  { value: "shirt", label: "Formal shirt" },
  { value: "blazer", label: "Blazer" },
  { value: "suit", label: "Suit and tie" },
  { value: "kurta", label: "Formal kurta" },
];
const BACKGROUND = [
  { value: "white", label: "White" },
  { value: "grey", label: "Light grey" },
  { value: "blue", label: "Light blue" },
];

function Choice({ name, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={name} className="mt-2 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
            value === option.value ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Tabs({ tab, onChange }) {
  const tabs = [
    { id: "photo", label: "Resume photo" },
    { id: "check", label: "Interview check" },
  ];
  return (
    <div role="tablist" className="mb-8 inline-flex rounded-full border border-line bg-surface p-1">
      {tabs.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={tab === item.id}
          onClick={() => onChange(item.id)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === item.id ? "bg-ink text-white" : "text-muted hover:text-ink"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function ResumePhoto() {
  const [file, setFile] = useState(null);
  const [attire, setAttire] = useState("shirt");
  const [background, setBackground] = useState("grey");
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleSelect(selected) {
    setError("");
    setNotice("");
    setResult(null);
    try {
      setFile(await prepareUpload(selected));
    } catch (err) {
      setError(friendlyError(err, "We couldn't open that photo. Please try another one."));
    }
  }

  async function handleMake() {
    setError("");
    setNotice("");
    setWorking(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      form.append("attire", attire);
      form.append("background", background);
      setResult(await api.post("/api/placement/photos", form));
    } catch (err) {
      setError(friendlyError(err, "Something went wrong. Please try again."));
    } finally {
      setWorking(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/api/history/${result.id}`);
      setResult(null);
      setNotice("That photo was deleted.");
    } catch (err) {
      setError(friendlyError(err, "We couldn't delete this photo. Try again."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      <div>
        {error && <Alert className="mb-5">{error}</Alert>}
        {notice && <Alert type="notice" className="mb-5">{notice}</Alert>}
        {!file ? (
          <UploadBox onSelect={handleSelect} />
        ) : (
          <Card>
            <p className="font-display text-2xl font-semibold tracking-tight">Clothing</p>
            <Choice name="Clothing" options={ATTIRE} value={attire} onChange={setAttire} />
            <p className="mt-6 font-display text-2xl font-semibold tracking-tight">Background</p>
            <Choice name="Background" options={BACKGROUND} value={background} onChange={setBackground} />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={handleMake} loading={working}>
                {result ? "Make it again" : "Make my photo"}
              </Button>
              <Button variant="secondary" onClick={() => { setFile(null); setResult(null); }} disabled={working}>
                Use another photo
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted">
              Look straight at the camera in good light. The AI keeps your face the same and changes the clothes and
              background.
            </p>
          </Card>
        )}
      </div>

      <div>
        {working ? (
          <div className="flex aspect-[4/5] animate-pulse items-center justify-center rounded-xl bg-line px-6 text-center text-sm text-muted">
            Making your photo. This can take up to a minute.
          </div>
        ) : result ? (
          <Reveal onLoad>
            <PrivateImage
              imageId={result.image_id}
              alt="Your resume photo"
              className="w-full rounded-xl"
              downloadName="resume-photo.jpg"
            />
            <div className="mt-3">
              <Button variant="ghost" onClick={handleDelete} loading={deleting}>
                Delete this photo
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted">
              Check the photo carefully before you use it. AI can change small details, and some companies ask for an
              unedited photo.
            </p>
          </Reveal>
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center rounded-xl border-2 border-dashed border-ink/25 px-6 text-center text-sm text-muted">
            Your resume photo will show here.
          </div>
        )}
      </div>
    </div>
  );
}

function InterviewCheck() {
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSelect(selected) {
    setError("");
    setResult(null);
    setWorking(true);
    try {
      const form = new FormData();
      form.append("photo", await prepareUpload(selected));
      setResult(await api.post("/api/placement/check", form));
    } catch (err) {
      setError(friendlyError(err, "Something went wrong. Please try again."));
    } finally {
      setWorking(false);
    }
  }

  const data = result?.metrics;

  return (
    <div className="max-w-3xl">
      {error && <Alert className="mb-5">{error}</Alert>}

      {working ? (
        <Card className="py-14 text-center">
          <p className="font-display text-3xl font-semibold tracking-tight">Checking your look</p>
          <p className="mt-2 text-muted">This takes a few seconds.</p>
        </Card>
      ) : data ? (
        <Reveal onLoad>
          <p className="text-sm text-muted">Your interview look</p>
          <p className="font-display text-7xl font-semibold leading-none tracking-tight">
            {data.overall}
            <span className="text-3xl text-muted"> / 100</span>
          </p>
          <p className="mt-4 max-w-xl text-lg text-muted">{data.summary}</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {data.checks.map((check, index) => (
              <ScoreBar key={check.name} label={check.name} value={check.score} hint={check.tip} delay={index * 0.08} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <Button variant="secondary" onClick={() => setResult(null)}>
              Check another photo
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted">
            This is friendly advice about grooming and clothes only. Your photo is not saved.
          </p>
        </Reveal>
      ) : (
        <>
          <UploadBox onSelect={handleSelect} />
          <p className="mt-4 text-sm text-muted">
            Wear what you plan to wear and stand in front of a plain wall. We check your hair, grooming, clothes,
            background, light and posture. Your photo is not saved.
          </p>
        </>
      )}
    </div>
  );
}

export default function PlacementStudioPage() {
  const [tab, setTab] = useState("photo");

  return (
    <>
      <title>Placement studio | StyleScan AI</title>
      <AppShell
        title="Placement studio"
        description="Make a clean, formal photo for your resume, or get a quick check of your interview look."
      >
        <Tabs tab={tab} onChange={setTab} />
        {tab === "photo" ? <ResumePhoto /> : <InterviewCheck />}
      </AppShell>
    </>
  );
}