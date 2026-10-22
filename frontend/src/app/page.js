import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import FaceDiagram from "@/components/ui/FaceDiagram";

export const metadata = {
  title: "StyleScan AI | Find the haircut and glasses that fit your face",
};

const WHAT_IT_DOES = [
  {
    name: "Photo editor",
    text: "Crop, straighten, adjust light and colour, add filters and text, then save. It runs in your browser, so your photo stays on your device.",
  },
  {
    name: "Photo enhancer",
    text: "Make a small, blurry or old photo sharper. The AI runs inside your browser, so nothing is uploaded.",
  },
  {
    name: "Portrait tools",
    text: "Blur the background, swap it for a colour or a picture, or remove it. Gently smooth skin and even out its tone. All in your browser.",
  },
  {
    name: "My gallery",
    text: "Save the pictures you like in one private place. Download them, edit them again or delete them any time.",
  },
  {
    name: "Face analysis",
    text: "We measure your forehead, cheekbones, jaw and face length to find your face shape. Then you get haircut, beard and glasses ideas that suit it.",
  },
  {
    name: "Trial room",
    text: "Coming soon. Type what you want to try, like “leather jacket” or “short beard”, and see yourself in it before you buy.",
  },
  {
    name: "Skin tracker",
    text: "Scan your skin once a day. A simple graph shows if your routine is working.",
  },
  {
    name: "Style assistant",
    text: "Ask a question in plain words. The answer uses your own results, not general tips.",
  },
  {
    name: "Daily tip",
    text: "One short idea each day, based on your latest scan.",
  },
];

const STEPS = [
  {
    title: "Upload a selfie",
    text: "Use a clear photo of your face in good light. It takes a few seconds.",
  },
  {
    title: "Read your results",
    text: "See your face shape, your measurements and the styles that fit.",
  },
  {
    title: "Try, track and improve",
    text: "Try new looks in the trial room and check your skin progress over time.",
  },
];

const PRIVACY = [
  {
    title: "Only you can see them",
    text: "Your photos and results are private to your account.",
  },
  {
    title: "Delete them any time",
    text: "Remove your photos or your whole account whenever you want.",
  },
  {
    title: "Passwords stay secret",
    text: "We save a scrambled version of your password, never the password itself.",
  },
];

export default function IntroPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:pb-28 lg:pt-20">
          <div>
            <Reveal onLoad>
              <h1 className="font-display text-[3.5rem] font-semibold leading-[0.92] tracking-tight sm:text-7xl lg:text-[5.75rem]">
                Find the haircut and glasses that fit your face.
              </h1>
            </Reveal>
            <Reveal onLoad delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Upload one selfie. StyleScan AI measures your face, finds your
                face shape and shows you the styles that suit it. A free photo
                editor helps you polish the picture too.
              </p>
            </Reveal>
            <Reveal onLoad delay={0.2} className="mt-9 flex flex-wrap gap-3">
              <Button href="/signup" size="lg">
                Create account
              </Button>
              <Button href="/#how-it-works" variant="secondary" size="lg">
                See how it works
              </Button>
            </Reveal>
            <Reveal onLoad delay={0.3}>
              <p className="mt-5 text-sm text-muted">
                Free to use. Your photos stay private.
              </p>
            </Reveal>
          </div>

          <div className="rounded-2xl bg-ink p-5 sm:p-8">
            <FaceDiagram className="w-full" />
            <Reveal
              onLoad
              delay={3.4}
              className="mt-6 border-t border-white/15 pt-5 text-white"
            >
              <p className="text-sm text-white/60">Example result</p>
              <p className="mt-1 font-display text-3xl font-semibold">
                Oval face
              </p>
              <p className="mt-2 max-w-md text-white/75">
                Your jaw is narrower than your cheekbones. Most haircuts and
                frame styles suit this shape.
              </p>
            </Reveal>
          </div>
        </section>

        {/* What it does */}
        <section
          id="what-it-does"
          className="mx-auto max-w-6xl scroll-mt-16 px-5 pb-20 lg:px-8 lg:pb-28"
        >
          <h2 className="font-display text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
            What you can do
          </h2>

          <ul className="mt-12 border-t border-ink">
            {WHAT_IT_DOES.map((item) => (
              <li
                key={item.name}
                className="grid gap-2 border-b border-line py-7 transition-colors hover:bg-surface md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-12 md:px-4"
              >
                <h3 className="font-display text-3xl font-semibold tracking-tight">
                  {item.name}
                </h3>
                <p className="max-w-xl text-[17px] leading-relaxed text-muted">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-16 border-y border-line bg-surface py-20 lg:py-28"
        >
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <h2 className="font-display text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
              How it works
            </h2>

            <div className="ruler mt-12" aria-hidden="true" />

            <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <Reveal delay={index * 0.1}>
                    <span className="inline-block border-b-4 border-tape pb-1 font-display text-6xl font-semibold leading-none">
                      {index + 1}
                    </span>
                    <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xs text-[17px] leading-relaxed text-muted">
                      {step.text}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Privacy */}
        <section
          id="privacy"
          className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20 lg:px-8 lg:py-28"
        >
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <h2 className="font-display text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
              Your photos stay yours.
            </h2>
            <div>
              <dl className="border-t border-ink">
                {PRIVACY.map((item) => (
                  <div
                    key={item.title}
                    className="border-b border-line py-6 md:grid md:grid-cols-[1fr_1.4fr] md:gap-8"
                  >
                    <dt className="font-display text-2xl font-semibold tracking-tight">
                      {item.title}
                    </dt>
                    <dd className="mt-1 text-[17px] leading-relaxed text-muted md:mt-0">
                      {item.text}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/privacy"
                className="mt-6 inline-block text-[17px] font-medium underline underline-offset-4"
              >
                Read the full privacy page
              </Link>
            </div>
          </div>
        </section>

        {/* Final call to action and footer */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
            <h2 className="max-w-2xl font-display text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
              See what fits before you spend money.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-white/70">
              Create a free account and upload your first selfie.
            </p>
            <Button href="/signup" variant="light" size="lg" className="mt-9">
              Create account
            </Button>
          </div>

          <footer className="border-t border-white/15">
            <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <Logo tone="light" />
              <div className="flex items-center gap-6">
                <Link
                  href="/login"
                  className="transition-colors hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="transition-colors hover:text-white"
                >
                  Create account
                </Link>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-white"
                >
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