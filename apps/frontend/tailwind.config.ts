import { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E0783B", // Cor institucional principal
        secondary: "#3A3A3A", // Cor institucional secundária
        tertiary: "#DDDDDD", // Cor institucional terciária
        darkBg: "#202020", // Cor de fundo escura
      },
      fontFamily: {
        coheadline: ['"Co Headline"', "sans-serif"],
        gotham: ['"Gotham XLight"', "sans-serif"],
        bebas: ['"Bebas Neue Pro SemiExpanded"', "sans-serif"],
        inter: ['"InterVariable"', "sans-serif"],
      },
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};

export default config;
