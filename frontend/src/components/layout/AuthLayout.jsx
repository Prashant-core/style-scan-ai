import Logo from "@/components/ui/Logo";
import FaceDiagram from "@/components/ui/FaceDiagram";

// The shared frame for the login and sign up pages.
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Logo tone="light" />

        <div>
          <FaceDiagram className="mx-auto w-full max-w-md" />
          <p className="mt-10 max-w-sm font-display text-4xl font-semibold leading-[1.05]">
            See what fits your face before you spend money.
          </p>
        </div>

        <p className="text-sm text-white/60">Your photos are private. Delete them any time.</p>
      </aside>

      <main className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-5xl font-semibold leading-none tracking-tight">{title}</h1>
          <p className="mt-3 text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <p className="mt-8 text-sm text-muted">{footer}</p>}
        </div>
      </main>
    </div>
  );
}