import type { RouterConfig } from "@nuxt/schema";

export default {
  routes: (_routes) => [
    {
      name: "usd",
      path: "/usd",
      component: () => import("~/pages/index.vue"),
    },
    {
      path: "/usd-ccl/:entity+",
      redirect: (to) => {
        const entity = to.params.entity;
        const slug = Array.isArray(entity) ? entity.join("/") : entity;
        return `/usd/${slug}`;
      },
    },
    {
      path: "/terminal/usd-ccl",
      redirect: "/terminal/usd",
    },
    {
      path: "/graficos/usd-ccl",
      redirect: "/graficos/usd",
    },
    ..._routes,
  ],
} satisfies RouterConfig;
