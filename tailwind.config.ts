import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: {
          50: "#1e293b",
          100: "#141c2e",
          200: "#0f1624",
          300: "#0a0f1a",
        },
        auriga: {
          blue: "#38bdf8",
          indigo: "#6366f1",
          purple: "#a855f7",
          emerald: "#10b981",
          amber: "#f59e0b",
        }
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-lg": "0 16px 48px 0 rgba(0, 0, 0, 0.55)",
        "glow-indigo": "0 0 30px -5px rgba(99, 102, 241, 0.35)",
        "glow-emerald": "0 0 30px -5px rgba(16, 185, 129, 0.35)",
        "inner-light": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
