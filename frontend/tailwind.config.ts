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
        ocean: {
          950: "#020b18",
          900: "#040f1e",
          800: "#071524",
          700: "#0a1e30",
          600: "#0d2a42",
          500: "#0f3554",
          400: "#1a4a72",
          300: "#1e5c8a",
          200: "#2475b0",
          100: "#3a8fd1",
        },
        cyan: {
          glow: "#00d4ff",
          bright: "#22e5ff",
          mid: "#0ea5e9",
          dark: "#0369a1",
        },
        neon: {
          blue: "#00d4ff",
          purple: "#7c3aed",
          green: "#10b981",
          pink: "#ec4899",
          amber: "#f59e0b",
        },
      },
      backgroundImage: {
        "ocean-gradient":
          "linear-gradient(180deg, #020b18 0%, #071524 30%, #0a1e30 60%, #0d2a42 100%)",
        "card-glass":
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
        "neon-glow":
          "linear-gradient(90deg, #00d4ff, #7c3aed, #00d4ff)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "wave": "wave 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-slow": "bounce 3s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 212, 255, 0.7)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        wave: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.1)",
        "glow-purple": "0 0 20px rgba(124, 58, 237, 0.4)",
        "card": "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        "card-hover": "0 16px 48px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
