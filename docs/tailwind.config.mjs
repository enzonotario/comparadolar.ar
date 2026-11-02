/** @type {import('tailwindcss').Config} */
export default {
  /** Same as VitePress (`<html class="dark">`), not prefers-color-scheme. */
  darkMode: "class",
  content: ["./*.md", "./operations/**/*.md", "./.vitepress/**/*.{vue,js,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
