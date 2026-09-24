export function getProviderConditions(item: {
  conditions?: string | null;
}): string | null {
  const conditions = item.conditions?.trim();
  return conditions ? conditions : null;
}

export function hasProviderConditions(item: {
  conditions?: string | null;
}): boolean {
  return getProviderConditions(item) !== null;
}

/**
 * Un proveedor con condiciones de acceso se lista en la tabla.
 * Las cards de resumen lo incluyen salvo que el usuario desmarque
 * "Con condiciones". Avisos e imágenes OG siguen fuera.
 */
export function isRankableProvider(item: {
  conditions?: string | null;
}): boolean {
  return !hasProviderConditions(item);
}
