import { ImageResponse } from "next/og";

// The app icons are drawn here in code, so there are no image files to add.
// They are made once when the site is built:
//   /icons/192, /icons/512      the normal icons (rounded square)
//   /icons/maskable             for Android, which cuts its own shape, so the picture sits in the middle
//   /icons/apple                for iPhone and iPad, which round the corners themselves
export const dynamic = "force-static";

const SIZES = { 192: 192, 512: 512, maskable: 512, apple: 180 };

export function generateStaticParams() {
  return Object.keys(SIZES).map((name) => ({ name }));
}

export async function GET(request, { params }) {
  const { name } = await params;
  const size = SIZES[name];
  if (!size) return new Response("Not found", { status: 404 });

  // Maskable icons need the picture to sit inside the middle 80%. Others can use more of the space.
  const mark = name === "maskable" ? 0.8 : 1;
  const rounded = name === "192" || name === "512";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141414",
          borderRadius: rounded ? size * 0.22 : 0,
        }}
      >
        <svg width={size * mark} height={size * mark} viewBox="0 0 32 32" fill="none">
          <ellipse cx="16" cy="16" rx="6.5" ry="8.5" stroke="#f4f3f0" strokeWidth="1.6" />
          <path d="M7 16h18M7 12.5v7M25 12.5v7" stroke="#ffc933" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}