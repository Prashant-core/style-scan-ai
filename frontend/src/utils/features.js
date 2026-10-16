import {
  Activity,
  Briefcase,
  History,
  House,
  MessageCircle,
  ScanFace,
  Settings,
  Shirt,
} from "lucide-react";

// status "live" opens the page. status "soon" shows a "Coming soon" tag.
// When a page is finished, change its status to "live".

export const HOME_ITEM = { href: "/home", label: "Home", icon: House };

export const FEATURES = [
  {
    href: "/face-analysis",
    label: "Face analysis",
    summary: "Find your face shape and get haircut, beard and glasses ideas that fit it.",
    icon: ScanFace,
    status: "live",
  },
  {
    href: "/trial-room",
    label: "Trial room",
    summary: "Type what you want to wear and see yourself in it before you buy.",
    icon: Shirt,
    status: "live",
  },
  {
    href: "/placement-studio",
    label: "Placement studio",
    summary: "Make a clean, formal photo for your resume and check your interview look.",
    icon: Briefcase,
    status: "live",
  },
  {
    href: "/skin-tracker",
    label: "Skin tracker",
    summary: "Scan your skin each day and see on a graph if your routine works.",
    icon: Activity,
    status: "live",
  },
  {
    href: "/assistant",
    label: "Style assistant",
    summary: "Ask a question and get an answer based on your own results.",
    icon: MessageCircle,
    status: "live",
  },
];

export const ACCOUNT_ITEMS = [
  { href: "/history", label: "History", icon: History, status: "live" },
  { href: "/settings", label: "Settings", icon: Settings, status: "live" },
];