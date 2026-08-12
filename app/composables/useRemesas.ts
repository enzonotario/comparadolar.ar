import type { RemesaOption, RemesasResponse } from "~/lib/remesas";

export function useRemesas() {
  return useAsyncData("remesas", async () => {
    const response = await $fetch<RemesasResponse>(
      "https://api.argentinadatos.com/v1/finanzas/remesas",
    );
    return {
      remesas: response.remesas ?? ([] as RemesaOption[]),
      fechaActualizacion: response.fechaActualizacion ?? null,
    };
  });
}
