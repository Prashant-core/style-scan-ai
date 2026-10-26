import Link from "next/link";
import { ArrowRight, Laptop, Smartphone, Tablet, Download } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import SiteFooter from "@/components/ui/SiteFooter";
import ActionBar from "@/components/home/ActionBar";
import Carousel from "@/components/home/Carousel";
import GoalTabs from "@/components/home/GoalTabs";
import MediaCard from "@/components/home/MediaCard";
import { ChatArt, FaceArt, SkinArt } from "@/components/home/CardArt";
import { EditorIcon, FaceIcon } from "@/components/ui/ToolIcons";

export const metadata = {
  title: "StyleScan AI | Edit, enhance and style your photos",
};

const W = "/wall/";

// The tall cards at the top of the page
const HERO_CARDS = [
  { href: "/enhance", title: "Sharpen any small photo", tag: "Enhancer", before: W + "enhance-before.jpg", after: W + "enhance-after.jpg" },
  { href: "/portrait", title: "Blur or remove the background", tag: "Portrait", before: W + "blur-before.jpg", after: W + "blur-after.jpg" },
  { href: "/editor", title: "Fix the light in one tap", tag: "Auto-fix", before: W + "autofix-before.jpg", after: W + "autofix-after.jpg" },
  { href: "/face-analysis", title: "Find your face shape", tag: "Face analysis", after: W + "face-shape.jpg" },
  { href: "/editor", title: "Crop, filter and add text", tag: "Editor", before: W + "filters-before.jpg", after: W + "filters-after.jpg" },
];

const GOALS = [
  {
    id: "profile",
    label: "Profile photo",
    cards: [
      { href: "/portrait", title: "Blur a busy background", tag: "Portrait", before: W + "blur-before.jpg", after: W + "blur-after.jpg" },
      { href: "/portrait", title: "Smooth skin, keep detail", tag: "Portrait", before: W + "smooth-before.jpg", after: W + "smooth-after.jpg" },
      { href: "/editor", title: "Brighten a dark photo", tag: "Auto-fix", before: W + "autofix-before.jpg", after: W + "autofix-after.jpg" },
    ],
  },
  {
    id: "social",
    label: "Social post",
    cards: [
      { href: "/editor", title: "Crop to a square and add a filter", tag: "Editor", before: W + "filters-before.jpg", after: W + "filters-after.jpg" },
      { href: "/editor", title: "Add text on your photo", tag: "Editor", after: W + "saved.jpg" },
      { href: "/enhance", title: "Sharpen before you post", tag: "Enhancer", before: W + "enhance-before.jpg", after: W + "enhance-after.jpg" },
    ],
  },
  {
    id: "old",
    label: "Old or small photo",
    cards: [
      { href: "/enhance", title: "Make it twice as big and sharp", tag: "Enhancer", before: W + "enhance-before.jpg", after: W + "enhance-after.jpg" },
      { href: "/editor", title: "Fix colour and contrast", tag: "Auto-fix", before: W + "autofix-before.jpg", after: W + "autofix-after.jpg" },
      { href: "/gallery", title: "Keep the result in your gallery", tag: "Gallery", after: W + "saved.jpg" },
    ],
  },
  {
    id: "look",
    label: "My look",
    cards: [
      { href: "/face-analysis", title: "Find your face shape", tag: "Face analysis", after: W + "face-shape.jpg" },
      { href: "/face-analysis", title: "Get haircut and glasses ideas", tag: "Face analysis", after: W + "face-shape.jpg" },
      { href: "/skin-tracker", title: "Track your skin over time", tag: "Skin tracker", after: W + "smooth-after.jpg" },
    ],
  },
];

const SCREENS = [
  { icon: Smartphone, title: "On your phone", text: "Large buttons and sliders you can reach with a thumb." },
  { icon: Tablet, title: "On a tablet", text: "The tools sit beside your photo, so you can see every change." },
  { icon: Laptop, title: "On a computer", text: "Keyboard shortcuts such as Ctrl+Z, plus the full-size photo." },
  { icon: Download, title: "As an app", text: "Install it on your Android home screen.", soon: true },
];

const PRIVACY = [
  { title: "On your device", text: "The photo editor, enhancer and portrait tools run in your browser. Your photo is not uploaded while you use them." },
  { title: "Private to you", text: "Anything you save is shown only to your account. Every account has its own random ID." },
  { title: "Delete anything", text: "Remove one picture, all of them, or your whole account. It takes a few clicks." },
];

function SectionHead({ icon: Icon, title, href, linkLabel }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <h2 className="flex items-center gap-3 font-display text-3xl leading-none sm:text-5xl">
        {Icon && <Icon className="size-8 shrink-0 sm:size-10" />}
        {title}
      </h2>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1.5 text-[15px] font-medium">
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export default function IntroPage() {
  return (
    <>
      {/* A thin bar at the very top, about what is new */}
      <div className="bg-accent text-on-accent">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-2.5 text-sm">
          <p className="font-medium">
            New: Portrait tools. Blur or remove a background in your browser.
          </p>
          <Link
            href="/portrait"
            className="rounded-full bg-black px-3.5 py-1 text-[13px] font-medium text-white transition-transform hover:-translate-y-px"
          >
            Try it
          </Link>
        </div>
      </div>

      <Navbar />

      <main>
        {/* Top: a headline and a row of tall cards */}
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-10 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-12 lg:px-8 lg:pb-24 lg:pt-16">
          <Reveal onLoad className="flex flex-col items-start gap-6">
            <h1 className="font-display text-[2.6rem] leading-[1.1] sm:text-6xl">
              Edit, enhance and style your photos on{" "}
              <span className="whitespace-nowrap rounded-md bg-accent px-2 text-on-accent">every screen</span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-muted">
              A photo editor, an AI enhancer, portrait tools and a face and skin guide. They run in your browser, so
              your photo stays on your device.
            </p>
            <Button href="/signup" variant="accent" pill size="lg">
              Start creating
              <ArrowRight className="size-5" aria-hidden="true" />
            </Button>
          </Reveal>

          <Reveal onLoad delay={0.1} className="min-w-0">
            <Carousel label="What you can do">
              {HERO_CARDS.map((card) => (
                <MediaCard key={card.title} {...card} size="w-[210px] aspect-[9/16] sm:w-[250px]" />
              ))}
            </Carousel>
          </Reveal>
        </section>

        {/* Photo tools */}
        <section id="what-it-does" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-12 lg:px-8 lg:py-16">
          <Reveal>
            <SectionHead icon={EditorIcon} title="Edit photos in your browser" href="/editor" linkLabel="Open the editor" />
          </Reveal>
          <Carousel label="Photo tools" className="mt-8">
            <MediaCard href="/editor" title="Photo editor: crop, light, colour, filters, text" tag="Editor" before={W + "filters-before.jpg"} after={W + "filters-after.jpg"} size="w-[280px] aspect-[4/3] sm:w-[420px]" />
            <MediaCard href="/enhance" title="Photo enhancer: sharper and twice as big" tag="AI" before={W + "enhance-before.jpg"} after={W + "enhance-after.jpg"} size="w-[280px] aspect-[4/3] sm:w-[420px]" />
            <MediaCard href="/portrait" title="Portrait tools: change the background" tag="Portrait" before={W + "blur-before.jpg"} after={W + "blur-after.jpg"} size="w-[280px] aspect-[4/3] sm:w-[420px]" />
            <MediaCard href="/gallery" title="My gallery: your saved edits, private" tag="Private" after={W + "saved.jpg"} size="w-[280px] aspect-[4/3] sm:w-[420px]" />
          </Carousel>
        </section>

        {/* Face and skin */}
        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <Reveal>
            <SectionHead icon={FaceIcon} title="Know your face and your skin" href="/face-analysis" linkLabel="Try face analysis" />
          </Reveal>
          <Carousel label="Face and skin" className="mt-8">
            <MediaCard href="/face-analysis" title="Face analysis: your shape and what suits it" tag="Face" size="w-[280px] aspect-[4/3] sm:w-[420px]">
              <FaceArt />
            </MediaCard>
            <MediaCard href="/skin-tracker" title="Skin tracker: see if your routine works" tag="Daily" size="w-[280px] aspect-[4/3] sm:w-[420px]">
              <SkinArt />
            </MediaCard>
            <MediaCard href="/assistant" title="Style assistant: answers from your results" tag="Chat" size="w-[280px] aspect-[4/3] sm:w-[420px]">
              <ChatArt />
            </MediaCard>
          </Carousel>
        </section>

        {/* Start from a goal */}
        <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-12 lg:px-8 lg:py-16">
          <Reveal>
            <SectionHead title="Start from what you want to make" />
          </Reveal>
          <div className="mt-8">
            <GoalTabs goals={GOALS} />
          </div>
        </section>

        {/* Every screen */}
        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <Reveal>
            <SectionHead title="Made for every screen" />
          </Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCREENS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="rounded-[20px] border border-line bg-surface p-6">
                  <div className="flex items-start justify-between">
                    <Icon className="size-9" strokeWidth={1.3} aria-hidden="true" />
                    {item.soon && <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">Soon</span>}
                  </div>
                  <h3 className="mt-10 font-display text-2xl">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Privacy */}
        <section id="privacy" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-12 lg:px-8 lg:py-16">
          <Reveal>
            <SectionHead title="Your photos stay yours" href="/privacy" linkLabel="Read the privacy page" />
          </Reveal>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {PRIVACY.map((item) => (
              <li key={item.title} className="flex flex-col justify-between gap-12 rounded-[20px] border border-line bg-surface p-7">
                <h3 className="font-display text-3xl leading-tight">{item.title}</h3>
                <p className="text-[16px] leading-relaxed text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Last call to action */}
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="flex flex-col items-start gap-6 rounded-[28px] bg-accent p-8 text-on-accent sm:p-14">
            <h2 className="max-w-2xl font-display text-4xl leading-none sm:text-6xl">Try it with one photo. It takes a minute.</h2>
            <Button href="/signup" pill size="lg" className="bg-black text-white hover:opacity-90">
              Start creating
              <ArrowRight className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
      <ActionBar />
    </>
  );
}