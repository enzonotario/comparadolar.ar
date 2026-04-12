import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";

import { GOOGLE_ANALYTICS_ID } from "../analytics";
import "./tailwind.css";
import { theme, useOpenapi } from "vitepress-openapi/client";
import "vitepress-openapi/dist/style.css";
import spec from "../../public/openapi.json" with { type: "json" };
import CustomLayout from "./CustomLayout.vue";

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  async enhanceApp({ app, router, siteData }) {
    const openapi = useOpenapi({
      spec,
      config: {
        i18n: {
          locale: "es",
        },
      },
    });

    theme.enhanceApp({ app, openapi });
  },
} satisfies Theme;
