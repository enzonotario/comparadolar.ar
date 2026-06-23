import type { ComputedRef } from "vue";

export function defineReactiveOgImage<T extends Record<string, unknown>>(
  component: string,
  propKeys: (keyof T)[],
  propsSource: ComputedRef<T>,
) {
  const reactiveProps = Object.fromEntries(
    propKeys.map((key) => [
      key,
      computed(() => propsSource.value[key]),
    ]),
  ) as { [K in keyof T]: ComputedRef<T[K]> };

  defineOgImage(component, reactiveProps);
}
