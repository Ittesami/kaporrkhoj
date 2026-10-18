import { DM_Sans, Fraunces } from "next/font/google";

export const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
export const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["600", "700"] });
