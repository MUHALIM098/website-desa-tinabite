/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tentukan file mana saja yang di-scan oleh Tailwind untuk class yang digunakan
  content: [
    "./views/**/*.ejs",
    "./public/js/**/*.js",
  ],
  theme: {
    extend: {
      // Warna kustom untuk identitas Desa Tinabite
      colors: {
        primary: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        secondary: {
          50:  "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
