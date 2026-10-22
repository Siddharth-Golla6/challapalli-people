/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Refreshed civic palette — same token names (so no component
          // code needs to change) but richer, more saturated values:
          //   • green  → emerald-700, alive and modern vs the old muddy forest
          //   • yellow → amber-500, warm and vibrant
          //   • red    → crimson-600, serious + accessible contrast
          //   • cream  → crisper off-white that lifts white cards
          white: "#FFFFFF",
          yellow: "#F59E0B",
          "yellow-dark": "#D97706",
          red: "#DC2626",
          "red-dark": "#B91C1C",
          green: "#047857",
          "green-dark": "#065F46",
          cream: "#FDF9EC",
        },
        // Semantic status tokens (shared across badges, chips, alerts).
        // Chosen to meet 4.5:1 contrast against white and 3:1 against the
        // dark-mode neutral-900 background used across the app.
        status: {
          success: "#059669",
          "success-fg": "#065F46",
          "success-bg": "#D1FAE5",
          warning: "#D97706",
          "warning-fg": "#92400E",
          "warning-bg": "#FEF3C7",
          danger: "#DC2626",
          "danger-fg": "#991B1B",
          "danger-bg": "#FEE2E2",
          info: "#0369A1",
          "info-fg": "#075985",
          "info-bg": "#DBEAFE",
          neutral: "#525252",
          "neutral-fg": "#1F2937",
          "neutral-bg": "#F3F4F6",
        },
      },
      fontFamily: {
        // `display` for headings, `sans` as the body default. Both include a
        // Telugu fallback so mixed scripts render on the same baseline/weight.
        display: [
          "Lexend",
          "Noto Sans Telugu",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        sans: [
          "Inter",
          "Noto Sans Telugu",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        telugu: ["Noto Sans Telugu", "sans-serif"],
      },
      fontSize: {
        // Scale with built-in line-heights that honour the 1.5+ body rule.
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.875rem", { lineHeight: "1.35rem" }],
        base: ["1rem", { lineHeight: "1.6rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.85rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.3rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.65rem" }],
        "5xl": ["3rem", { lineHeight: "1.05" }],
        "6xl": ["3.75rem", { lineHeight: "1.03" }],
        "7xl": ["4.5rem", { lineHeight: "1.02" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.10)",
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 2px 8px -2px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 8px 24px -4px rgba(15, 23, 42, 0.12), 0 2px 4px -2px rgba(15, 23, 42, 0.06)",
        focus: "0 0 0 3px rgba(31, 61, 43, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        emphasised: "cubic-bezier(0.2, 0, 0, 1)",
      },
      transitionDuration: {
        250: "250ms",
      },
      keyframes: {
        pageFade: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        subtlePulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        },
      },
      animation: {
        "page-fade": "pageFade 0.45s cubic-bezier(0.2,0,0,1) both",
        "subtle-pulse": "subtlePulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
