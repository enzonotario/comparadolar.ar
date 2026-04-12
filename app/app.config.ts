export default defineAppConfig({
  ui: {
    colors: {
      primary: "teal",
      secondary: "cyan",
      neutral: "zinc",
    },
    badge: {
      compoundVariants: [
        {
          color: "success",
          variant: "solid",
          class:
            "!bg-teal-100 !text-teal-800 dark:!bg-teal-900 dark:!text-teal-200",
        },
        {
          color: "warning",
          variant: "soft",
          class:
            "!bg-amber-100/50 !text-amber-800 dark:!bg-amber-900/50 dark:!text-amber-200",
        },
        {
          color: "secondary",
          variant: "soft",
          class:
            "!bg-cyan-100/50 !text-cyan-800 dark:!bg-cyan-900/50 dark:!text-cyan-200",
        },
        {
          color: "info",
          variant: "soft",
          class:
            "!bg-blue-100/50 !text-blue-800 dark:!bg-blue-900/50 dark:!text-blue-200",
        },
        {
          size: "xs",
          class: "text-[10px]",
        },
      ],
    },
  },
});
