"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import UploadBox from "@/components/features/UploadBox";
import PrivateImage from "@/components/features/PrivateImage";
import { api } from "@/utils/api";
import { friendlyError, prepareUpload } from "@/utils/photo";

const IDEAS = [
  "A short textured haircut",
  "A clean fade with a side part",
  "A neat short beard",
  "Round black glasses",
  "Thin rectangle glasses",
  "A navy blue blazer",
];

export default function TrialRoomPage() {
  const [photo, setPhoto] = useState(null); // { file, url }
  const [prompt, setPrompt] = useState("");
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState(false);

  const previewUrl = useRef(null);

  function setPreview(file) {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = file ? URL.createObjectURL(file) : null;
    return previewUrl.current;
  }

  useEffect(() => () => setPreview(null), []);

  async function handleSelect(file) {
    setError("");
    setNotice("");
    setResult(null);
    try {
      const ready = await prepareUpload(file);
      setPhoto({ file: ready, url: setPreview(ready) });
    } catch (err) {
      setError(friendlyError(err, "We couldn't open that photo. Please try another one."));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!photo || prompt.trim().length < 3) return;

    setError("");
    setNotice("");
    setWorking(true);
    try {
      const form = new FormData();
      form.append("photo", photo.file);
      form.append("prompt", prompt.trim());
      setResult(await api.post("/api/trial/looks", form));
    } catch (err) {
      setError(friendlyError(err, "Something went wrong. Please try again."));
    } finally {
      setWorking(false);
    }
  }

  async function handleDelete() {
    if (!result) return;
    setDeleting(true);
    try {
      await api.delete(`/api/history/${result.id}`);
      setResult(null);
      setNotice("That picture was deleted.");
    } catch (err) {
      setError(friendlyError(err, "We couldn't delete this picture. Try again."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <title>Trial room | StyleScan AI</title>
      <AppShell
        title="Trial room"
        description="Add your photo and describe a haircut, beard, glasses or clothes. See yourself in it before you decide."
      >
        {error && <Alert className="mb-6">{error}</Alert>}
        {notice && <Alert type="notice" className="mb-6">{notice}</Alert>}

        {!photo ? (
          <div className="max-w-2xl">
            <UploadBox onSelect={handleSelect} />
            <p className="mt-4 text-sm text-muted">
              Use a clear photo of your face and shoulders. Your pictures are private and you can delete them any time.
            </p>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="grid grid-cols-2 gap-4">
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="Your original photo" className="aspect-[3/4] w-full rounded-xl object-cover" />
                  <figcaption className="mt-2 text-sm text-muted">Before</figcaption>
                </figure>
                <figure>
                  {working ? (
                    <div className="flex aspect-[3/4] w-full animate-pulse flex-col items-center justify-center gap-3 rounded-xl bg-line px-4 text-center text-sm text-muted">
                      <Sparkles className="size-6" aria-hidden="true" />
                      Making your picture. This can take up to a minute.
                    </div>
                  ) : result ? (
                    <Reveal onLoad>
                      <PrivateImage
                        imageId={result.image_id}
                        alt="Your photo with the new look"
                        className="aspect-[3/4] w-full rounded-xl object-cover"
                        downloadName="stylescan-look.jpg"
                      />
                    </Reveal>
                  ) : (
                    <div className="flex aspect-[3/4] w-full items-center justify-center rounded-xl border-2 border-dashed border-ink/25 px-4 text-center text-sm text-muted">
                      Your new look will show here.
                    </div>
                  )}
                  <figcaption className="mt-2 text-sm text-muted">After</figcaption>
                </figure>
              </div>
            </div>

            <div>
              <Card>
                <form onSubmit={handleSubmit}>
                  <label htmlFor="look" className="font-display text-2xl font-semibold tracking-tight">
                    What do you want to try?
                  </label>
                  <textarea
                    id="look"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    maxLength={150}
                    rows={3}
                    placeholder="For example: a short beard and round glasses"
                    className="mt-3 w-full resize-none rounded-lg border border-line bg-paper px-4 py-3 text-[15px] focus:border-ink focus:outline-none focus:ring-4 focus:ring-tape/50"
                  />
                  <p className="mt-1 text-right text-xs text-muted">{prompt.length}/150</p>

                  <p className="mt-3 text-sm text-muted">Or tap an idea:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {IDEAS.map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => setPrompt(idea)}
                        className="rounded-full border border-line px-3 py-1.5 text-sm transition-colors hover:border-ink hover:bg-tape/20"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button type="submit" loading={working} disabled={prompt.trim().length < 3}>
                      {result ? "Try this look" : "Show me"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setPhoto(null);
                        setPreview(null);
                        setResult(null);
                        setPrompt("");
                      }}
                      disabled={working}
                    >
                      Use another photo
                    </Button>
                  </div>
                </form>
              </Card>

              {result && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button variant="ghost" onClick={handleDelete} loading={deleting}>
                    Delete this picture
                  </Button>
                </div>
              )}

              <p className="mt-5 text-sm text-muted">
                This is an AI picture, so small details can change. Use it as an idea, not a promise.
              </p>
            </div>
          </div>
        )}
      </AppShell>
    </>
  );
}