/** @type {import('tailwindcss').Config} */
export default {
  /** Misma estrategia que VitePress (`<html class="dark">`), no `prefers-color-scheme`. */
  darkMode: "class",
  content: [
    "./*.md",
    "./operations/**/*.md",
    "./.vitepress/**/*.{vue,js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
