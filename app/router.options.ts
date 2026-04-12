import type { RouterConfig } from "@nuxt/schema";

export default {
  routes: (_routes) => [
    {
      name: "usd",
      path: "/usd",
      component: () => import("~/pages/index.vue"),
    },
    ..._routes,
  ],
} satisfies RouterConfig;
