import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Logo from "@/components/ui/Logo";

export const metadata = {
  title: "Privacy | StyleScan AI",
  description: "What StyleScan AI stores, what stays on your device, and how to delete it.",
};

const SECTIONS = [
  {
    title: "What stays on your device",
    items: [
      "The photo editor, the photo enhancer and the portrait tools run inside your browser. Your photo is not uploaded while you use them.",
      "Face analysis measures your face in your browser. The photo itself is never sent to our server. We only save the numbers and your face shape.",
    ],
  },
  {
    title: "What we store, and why",
    items: [
      "Your account: your name, username, email and a scrambled version of your password (we never keep the password itself).",
      "Your results: face analysis results and skin scan scores, so you can see them in History and on the skin graph.",
      "Your photos, only when a feature needs them: skin scan photos, and pictures you press “Save to my gallery” on.",
      "A login code in your browser, so you stay signed in. It is removed when you log out.",
    ],
  },
  {
    title: "Who can see your photos",
    items: [
      "Only you. A photo is sent back only to the account that owns it, and every account has its own random ID.",
      "We do not sell your data and we do not show ads.",
    ],
  },
  {
    title: "Other services that see some of your data",
    items: [
      "Skin tracker: the skin scan photo is sent to Google's Gemini AI to be analysed. Google handles it under its own terms.",
      "Style assistant: your question, plus a short summary of your latest results, is sent to Groq's AI to write an answer.",
      "Hosting: the website runs on Vercel, the server on Render and the database on Neon.",
      "The AI models for the enhancer and portrait tools are downloaded to your browser from public servers. Your photo is not sent to them.",
    ],
  },
  {
    title: "Deleting your data",
    items: [
      "In History or My gallery you can delete any single item.",
      "In Settings you can delete all your photos, all your history, or your whole account. Deleting is permanent.",
      "Deleting your account removes your results and photos from our database. Copies Google or Groq received during a request are handled under their own policies.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-14 lg:px-8 lg:py-20">
        <h1 className="font-display text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
          Your photos stay yours.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          This page says in plain words what StyleScan AI does with your data. StyleScan AI is a student project, so
          we keep it simple: collect as little as possible and let you delete everything.
        </p>

        <div className="mt-12 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title} className="border-t border-ink pt-6">
              <h2 className="font-display text-3xl font-semibold tracking-tight">{section.title}</h2>
              <ul className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-[17px] leading-relaxed">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-tape" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-12 text-muted">
          Questions? Open <Link href="/settings" className="underline underline-offset-4">Settings</Link> to manage
          your data, or go back to the{" "}
          <Link href="/" className="underline underline-offset-4">
            home page
          </Link>
          .
        </p>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-8 text-sm text-muted lg:px-8">
          <Logo />
          <p>© {new Date().getFullYear()} StyleScan AI</p>
        </div>
      </footer>
    </>
  );
}