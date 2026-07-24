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
 * Un proveedor con condiciones de acceso no compite en igualdad con el resto:
 * se lista en la tabla, pero queda fuera de rankings y destacados.
 */
export function isRankableProvider(item: {
  conditions?: string | null;
}): boolean {
  return !hasProviderConditions(item);
}
