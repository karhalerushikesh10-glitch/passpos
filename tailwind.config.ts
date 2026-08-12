import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        stellar: {
          50: "#f0f4ff",
          100: "#e0e9fe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#0f172a",
        },
        passkey: {
          teal: "#14b8a6",
          emerald: "#10b981",
          cyan: "#06b6d4",
          purple: "#8b5cf6",
        },
        pos: {
          card: "#18181b",
          border: "#27272a",
          dark: "#09090b",
          accent: "#3b82f6",
          active: "#27272a",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(59, 130, 246, 0.4)",
        "glow-teal": "0 0 25px -5px rgba(20, 184, 166, 0.4)",
        pos: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))",
      },
    },
  },
  plugins: [],
};
export default config;
