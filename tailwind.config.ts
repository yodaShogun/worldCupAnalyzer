import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#0B1426",
        card: "#111E35",
        "card-hover": "#162542",
        "input-bg": "#0F1B30",
        "border-ui": "#1E3050",
        gold: "#F5A623",
        "gold-dim": "#7A521033",
        muted: "#8AA0BF",
        faint: "#4A6080",
        positive: "#22C55E",
        bubble: "#F97316",
        elim: "#EF4444",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      height: {
        navbar: "56px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.4)",
        "card-lg": "0 8px 32px rgba(0,0,0,0.6)",
        "gold-glow": "0 0 20px rgba(245,166,35,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
