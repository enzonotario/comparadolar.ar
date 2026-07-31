/**
 * defineOgImage hace toValue() eager de las props al momento del call.
 * Tras un await en setup se pierde el contexto Nuxt: capturar useNuxtApp()
 * ANTES del await y registrar la imagen con runWithContext.
 */
export function defineOgImageWithContext(
  nuxtApp: ReturnType<typeof useNuxtApp>,
  component: string,
  props: Record<string, unknown>,
) {
  nuxtApp.runWithContext(() => {
    defineOgImage(component, props);
  });
}
