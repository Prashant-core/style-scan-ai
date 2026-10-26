import {
  ChatIcon,
  EditorIcon,
  EnhanceIcon,
  FaceIcon,
  GalleryIcon,
  HistoryIcon,
  HomeIcon,
  PortraitIcon,
  SettingsIcon,
  ShirtIcon,
  SkinIcon,
} from "@/components/ui/ToolIcons";

// status "live" opens the page. status "soon" shows a "Coming soon" tag.
// When a page is finished, change its status to "live".

export const HOME_ITEM = { href: "/home", label: "Home", icon: HomeIcon };

export const FEATURES = [
  {
    href: "/editor",
    label: "Photo editor",
    summary: "Crop, adjust, add filters and text, then save your photo.",
    icon: EditorIcon,
    status: "live",
  },
  {
    href: "/enhance",
    label: "Photo enhancer",
    summary: "Make a small, soft or noisy photo sharper with AI that runs in your browser.",
    icon: EnhanceIcon,
    status: "live",
  },
  {
    href: "/portrait",
    label: "Portrait tools",
    summary: "Blur, change or remove the background, and gently smooth skin.",
    icon: PortraitIcon,
    status: "live",
  },
  {
    href: "/gallery",
    label: "My gallery",
    summary: "Your saved edits in one private place. Download, edit again or delete.",
    icon: GalleryIcon,
    status: "live",
  },
  {
    href: "/face-analysis",
    label: "Face analysis",
    summary: "Find your face shape and get haircut, beard and glasses ideas that fit it.",
    icon: FaceIcon,
    status: "live",
  },
  {
    href: "/trial-room",
    label: "Trial room",
    summary: "Type what you want to wear and see yourself in it before you buy.",
    icon: ShirtIcon,
    status: "soon", // needs a paid image AI. Change to "live" once billing is on for the Gemini key.
  },
  {
    href: "/skin-tracker",
    label: "Skin tracker",
    summary: "Scan your skin each day and see on a graph if your routine works.",
    icon: SkinIcon,
    status: "live",
  },
  {
    href: "/assistant",
    label: "Style assistant",
    summary: "Ask a question and get an answer based on your own results.",
    icon: ChatIcon,
    status: "live",
  },
];

export const ACCOUNT_ITEMS = [
  { href: "/history", label: "History", icon: HistoryIcon, status: "live" },
  { href: "/settings", label: "Settings", icon: SettingsIcon, status: "live" },
];