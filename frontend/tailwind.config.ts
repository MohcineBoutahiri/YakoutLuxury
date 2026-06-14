import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: "#0B0B0B",
          gold: "#C8A24A",
          ivory: "#F8F5EF",
          beige: "#E8DED0",
          text: "#6B6B6B",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body: ["var(--font-body)", "Inter", "Montserrat", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 24px 80px rgba(0, 0, 0, 0.18)",
        "luxury-soft": "0 18px 60px rgba(11, 11, 11, 0.08)",
        "luxury-gold": "0 18px 45px rgba(200, 162, 74, 0.22)",
      },
      borderRadius: {
        luxury: "0.375rem",
      },
      backgroundImage: {
        "luxury-surface":
          "linear-gradient(180deg, #F8F5EF 0%, #FFFFFF 52%, #F8F5EF 100%)",
        "luxury-dark":
          "linear-gradient(135deg, #0B0B0B 0%, #191714 58%, #0B0B0B 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
