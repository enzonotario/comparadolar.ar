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

  const buildRouteWithState = (basePath: string, _currency: CurrencyType) => {
    // Keep links stable during SSR/hydration. Terminal restores sort/selection
    // from localStorage on mount.
    return basePath;
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
