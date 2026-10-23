import Logo from "@/components/ui/Logo";
import { PhotoTile, WALL_ITEMS } from "@/components/home/PhotoWall";

// The shared frame for the login and sign up pages.
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between border-r border-line bg-surface p-12 lg:flex">
        <Logo />

        <div>
          <div className="mx-auto grid max-w-sm grid-cols-2 gap-3" aria-hidden="true">
            <PhotoTile item={WALL_ITEMS[0]} captions={false} />
            <PhotoTile item={WALL_ITEMS[1]} captions={false} />
          </div>
          <p className="mt-6 max-w-sm font-display text-4xl leading-[1.05]">
            Photo tools that stay on your device.
          </p>
        </div>

        <p className="text-sm text-muted">Your photos are private. Delete them any time.</p>
      </aside>

      <main className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-5xl leading-none">{title}</h1>
          <p className="mt-3 text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <p className="mt-8 text-sm text-muted">{footer}</p>}
        </div>
      </main>
    </div>
  );
}