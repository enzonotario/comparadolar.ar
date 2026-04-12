import type { CurrencyType } from "@/lib/types";

export function useTerminalState() {
  const getSortStorageKey = (currency: CurrencyType) =>
    `terminal-sort-${currency}`;

  const getSelectedStorageKey = (currency: CurrencyType) =>
    `terminal-selected-${currency}`;

  const storage = () =>
    typeof window !== "undefined" ? window.localStorage : null;

  const loadSavedState = (currency: CurrencyType) => {
    const s = storage();
    const savedSort = s?.getItem(getSortStorageKey(currency)) ?? null;
    const savedSelected = s?.getItem(getSelectedStorageKey(currency)) ?? null;

    return { savedSort, savedSelected };
  };

  const buildRouteWithState = (basePath: string, currency: CurrencyType) => {
    const { savedSort, savedSelected } = loadSavedState(currency);

    const queryParams = new URLSearchParams();
    if (savedSort) queryParams.set("sort", savedSort);
    if (savedSelected) queryParams.set("selected", savedSelected);

    const queryString = queryParams.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const saveSortToStorage = (currency: CurrencyType, value: string) => {
    storage()?.setItem(getSortStorageKey(currency), value);
  };

  const saveSelectedToStorage = (currency: CurrencyType, value: string) => {
    storage()?.setItem(getSelectedStorageKey(currency), value);
  };

  const clearState = (currency: CurrencyType) => {
    storage()?.removeItem(getSortStorageKey(currency));
    storage()?.removeItem(getSelectedStorageKey(currency));
  };

  return {
    getSortStorageKey,
    getSelectedStorageKey,
    loadSavedState,
    buildRouteWithState,
    saveSortToStorage,
    saveSelectedToStorage,
    clearState,
  };
}
