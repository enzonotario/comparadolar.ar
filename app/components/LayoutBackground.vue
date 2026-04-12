<script setup lang="ts">
interface Props {
  colorScheme?: "green" | "cyan" | "teal" | "orange" | "violet" | "blue";
}

const props = withDefaults(defineProps<Props>(), {
  colorScheme: "green",
});

const colorMode = useColorMode();

const lightGradientConfigs = {
  green: {
    primary: "rgba(16, 185, 129, 0.08)",
    secondary: "rgba(5, 150, 105, 0.06)",
    tertiary: "rgba(52, 211, 153, 0.05)",
    accent: "rgba(110, 231, 183, 0.04)",
  },
  cyan: {
    primary: "rgba(6, 182, 212, 0.08)",
    secondary: "rgba(8, 145, 178, 0.06)",
    tertiary: "rgba(34, 211, 238, 0.05)",
    accent: "rgba(103, 232, 249, 0.04)",
  },
  teal: {
    primary: "rgba(20, 184, 166, 0.08)",
    secondary: "rgba(13, 148, 136, 0.06)",
    tertiary: "rgba(45, 212, 191, 0.05)",
    accent: "rgba(94, 234, 212, 0.04)",
  },
  orange: {
    primary: "rgba(245, 158, 11, 0.08)",
    secondary: "rgba(217, 119, 6, 0.06)",
    tertiary: "rgba(251, 191, 36, 0.05)",
    accent: "rgba(252, 211, 77, 0.04)",
  },
  violet: {
    primary: "rgba(139, 92, 246, 0.08)",
    secondary: "rgba(124, 58, 237, 0.06)",
    tertiary: "rgba(167, 139, 250, 0.05)",
    accent: "rgba(196, 181, 253, 0.04)",
  },
  blue: {
    primary: "rgba(59, 130, 246, 0.08)",
    secondary: "rgba(37, 99, 235, 0.06)",
    tertiary: "rgba(96, 165, 250, 0.05)",
    accent: "rgba(147, 197, 253, 0.04)",
  },
};

const darkGradientConfigs = {
  green: {
    primary: "rgba(16, 185, 129, 0.12)",
    secondary: "rgba(5, 150, 105, 0.10)",
    tertiary: "rgba(52, 211, 153, 0.08)",
    accent: "rgba(110, 231, 183, 0.06)",
  },
  cyan: {
    primary: "rgba(6, 182, 212, 0.12)",
    secondary: "rgba(8, 145, 178, 0.10)",
    tertiary: "rgba(34, 211, 238, 0.08)",
    accent: "rgba(103, 232, 249, 0.06)",
  },
  teal: {
    primary: "rgba(20, 184, 166, 0.12)",
    secondary: "rgba(13, 148, 136, 0.10)",
    tertiary: "rgba(45, 212, 191, 0.08)",
    accent: "rgba(94, 234, 212, 0.06)",
  },
  orange: {
    primary: "rgba(245, 158, 11, 0.12)",
    secondary: "rgba(217, 119, 6, 0.10)",
    tertiary: "rgba(251, 191, 36, 0.08)",
    accent: "rgba(252, 211, 77, 0.06)",
  },
  violet: {
    primary: "rgba(139, 92, 246, 0.12)",
    secondary: "rgba(124, 58, 237, 0.10)",
    tertiary: "rgba(167, 139, 250, 0.08)",
    accent: "rgba(196, 181, 253, 0.06)",
  },
  blue: {
    primary: "rgba(59, 130, 246, 0.12)",
    secondary: "rgba(37, 99, 235, 0.10)",
    tertiary: "rgba(96, 165, 250, 0.08)",
    accent: "rgba(147, 197, 253, 0.06)",
  },
};

const backgroundStyle = computed(() => {
  const isDark = colorMode.value === "dark";
  const configs = isDark ? darkGradientConfigs : lightGradientConfigs;
  const colors = configs[props.colorScheme];

  return {
    background: `
      radial-gradient(ellipse 120% 80% at 70% 20%, ${colors.primary}, transparent 50%),
      radial-gradient(ellipse 100% 60% at 30% 10%, ${colors.secondary}, transparent 60%),
      radial-gradient(ellipse 90% 70% at 50% 0%, ${colors.tertiary}, transparent 65%),
      radial-gradient(ellipse 110% 50% at 80% 30%, ${colors.accent}, transparent 40%),
      transparent
    `,
  };
});
</script>

<template>
  <div class="fixed top-0 h-px w-full">
    <div class="relative w-full h-full">
      <div
        class="absolute inset-0 h-screen w-full pointer-events-none z-0 transition-all duration-300"
        :style="backgroundStyle"
      />
    </div>
  </div>
</template>
