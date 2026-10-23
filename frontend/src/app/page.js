import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import PhotoWall from "@/components/home/PhotoWall";

export const metadata = {
  title: "StyleScan AI | Photo tools that stay on your device",
};

const TOOLS = [
  {
    name: "Photo editor",
    text: "Crop, straighten, adjust light and colour, add filters and text. Auto-fix does the first pass for you.",
  },
  {
    name: "Photo enhancer",
    text: "Make a small, soft or old photo sharper with an AI model that runs inside your browser.",
  },
  {
    name: "Portrait tools",
    text: "Blur, replace or remove the background. Gently smooth skin and even out its tone.",
  },
  {
    name: "My gallery",
    text: "Save the pictures you like in one private place. Download, edit again or delete them.",
  },
  {
    name: "Face analysis",
    text: "Measure your face to find its shape, then get haircut, beard and glasses ideas that suit it.",
  },
  {
    name: "Skin tracker",
    text: "Scan your skin once a day and see on a simple graph whether your routine works.",
  },
  {
    name: "Style assistant",
    text: "Ask a question in plain words. The answer uses your own results.",
  },
  {
    name: "Trial room",
    text: "Coming soon. Type what you want to wear and see yourself in it before you buy.",
  },
];

const STEPS = [
  { title: "Open a photo", text: "Pick one from your phone or computer. Nothing is sent anywhere yet." },
  { title: "Edit it", text: "Use the tools. The work happens on your device, so it is quick and private." },
  { title: "Save or download", text: "Download it, or save it to your private gallery. Delete it whenever you like." },
];

const PRIVACY = [
  { title: "Only you can see them", text: "Your photos and results belong to your account." },
  { title: "Delete any time", text: "Remove one photo, all photos, or the whole account." },
  { title: "Passwords stay secret", text: "We keep a scrambled version of your password, never the password itself." },
];

export default function IntroPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Top: one calm sentence */}
        <section className="mx-auto grid max-w-6xl items-end gap-8 px-5 pb-14 pt-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:px-8 lg:pb-20 lg:pt-20">
          <Reveal onLoad>
            <h1 className="font-display text-[2.6rem] leading-[1] sm:text-6xl lg:text-[4.4rem]">
              Photo tools that stay on your device.
            </h1>
          </Reveal>
          <Reveal onLoad delay={0.08} className="flex flex-col gap-6 pb-1">
            <p className="max-w-md text-lg leading-relaxed text-muted">
              Edit, sharpen and clean up portraits right in your browser. Nothing is uploaded unless you choose to
              save it, and everything you save can be deleted.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button href="/signup" size="lg">
                Create free account
              </Button>
              <Link
                href="/#what-it-does"
                className="text-[15px] underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
              >
                See the tools
              </Link>
            </div>
          </Reveal>
        </section>

        {/* The photo wall */}
        <section className="mx-auto max-w-6xl px-5 pb-8 lg:px-8" aria-label="What the tools can do">
          <Reveal delay={0.05}>
            <PhotoWall />
          </Reveal>
        </section>

        {/* Tools */}
        <section id="what-it-does" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 lg:px-8 lg:py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Tools</p>
          <ul className="mt-5 border-t border-line">
            {TOOLS.map((item) => (
              <li
                key={item.name}
                className="grid gap-1 border-b border-line py-5 transition-colors hover:bg-surface md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-12 md:px-3"
              >
                <h2 className="font-display text-2xl">{item.name}</h2>
                <p className="max-w-xl text-[16px] leading-relaxed text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-surface py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">How it works</p>
            <ol className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <Reveal delay={index * 0.08}>
                    <h3 className="font-display text-2xl">{step.title}</h3>
                    <p className="mt-2 max-w-xs text-[16px] leading-relaxed text-muted">{step.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <h2 className="font-display text-4xl leading-none sm:text-5xl">Your photos stay yours.</h2>
            <div>
              <dl className="border-t border-line">
                {PRIVACY.map((item) => (
                  <div key={item.title} className="border-b border-line py-5 md:grid md:grid-cols-[1fr_1.4fr] md:gap-8">
                    <dt className="font-display text-xl">{item.title}</dt>
                    <dd className="mt-1 text-[16px] leading-relaxed text-muted md:mt-0">{item.text}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/privacy"
                className="mt-6 inline-block text-[15px] underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
              >
                Read the full privacy page
              </Link>
            </div>
          </div>
        </section>

        {/* Last call to action and footer */}
        <section className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 lg:px-8 lg:py-24">
            <h2 className="max-w-2xl font-display text-4xl leading-none sm:text-5xl">
              Try it with one photo. It takes a minute.
            </h2>
            <Button href="/signup" size="lg">
              Create free account
            </Button>
          </div>

          <footer className="border-t border-line">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-sm text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <Logo />
              <div className="flex items-center gap-6">
                <Link href="/login" className="transition-colors hover:text-ink">
                  Log in
                </Link>
                <Link href="/signup" className="transition-colors hover:text-ink">
                  Create account
                </Link>
                <Link href="/privacy" className="transition-colors hover:text-ink">
                  Privacy
                </Link>
              </div>
              <p>© {new Date().getFullYear()} StyleScan AI</p>
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}