/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Identidade visual oficial FullEnergy
        fullenergy: {
          yellow: "#FFD700", // cor primaria
          black: "#1A1A1A", // cor secundaria
          accent: "#FAA41A", // cor de destaque (laranja)
          gray: "#4A4A4A", // cinza institucional
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
