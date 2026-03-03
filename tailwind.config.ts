import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "loading-bar": {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(300%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "loading-bar": "loading-bar 1.4s ease-in-out infinite",
      },
      colors: {
        brand: {
          50: "#fef5f0",
          100: "#fde8dc",
          200: "#fad0b8",
          300: "#f6b08a",
          400: "#f1885b",
          500: "#ef6b2a",
          600: "#e0511f",
          700: "#ba3d1c",
          800: "#94331e",
          900: "#782c1b",
          950: "#40140c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
