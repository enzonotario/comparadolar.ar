// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default withNuxt([
  // Root flat-gitignore only reads the top-level .gitignore, so nested
  // docs/.gitignore entries (e.g. .vitepress/cache) are not applied here.
  // Without these ignores, `eslint .` formats VitePress dep bundles (tens of MB)
  // via prettier/prettier and can hang for minutes.
  {
    name: "comparadolar/ignores",
    ignores: ["docs/**", "**/.vitepress/cache/**", "**/.vitepress/dist/**"],
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "vue/block-order": [
        "error",
        {
          order: ["script", "template", "style"],
        },
      ],
    },
  },
]);
