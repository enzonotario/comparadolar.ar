import type { CurrencyType } from "~/lib/types";

export function useChartState() {
  const getRangeStorageKey = (currency: CurrencyType) =>
    `chart-range-${currency}`;

  const getValueTypeStorageKey = (currency: CurrencyType) =>
    `chart-value-type-${currency}`;

  const getProvidersStorageKey = (currency: CurrencyType) =>
    `chart-providers-${currency}`;

  const storage = process.client ? localStorage : null;

  const loadSavedState = (currency: CurrencyType) => {
    const savedRange = storage?.getItem(getRangeStorageKey(currency)) ?? null;
    const savedValueType =
      storage?.getItem(getValueTypeStorageKey(currency)) ?? null;
    const savedProviders =
      storage?.getItem(getProvidersStorageKey(currency)) ?? null;

    return { savedRange, savedValueType, savedProviders };
  };

  const saveRangeToStorage = (currency: CurrencyType, value: string) => {
    storage?.setItem(getRangeStorageKey(currency), value);
  };

  const saveValueTypeToStorage = (currency: CurrencyType, value: string) => {
    storage?.setItem(getValueTypeStorageKey(currency), value);
  };

  const saveProvidersToStorage = (currency: CurrencyType, value: string) => {
    storage?.setItem(getProvidersStorageKey(currency), value);
  };

  const clearState = (currency: CurrencyType) => {
    storage?.removeItem(getRangeStorageKey(currency));
    storage?.removeItem(getValueTypeStorageKey(currency));
    storage?.removeItem(getProvidersStorageKey(currency));
  };

  return {
    getRangeStorageKey,
    getValueTypeStorageKey,
    getProvidersStorageKey,
    loadSavedState,
    saveRangeToStorage,
    saveValueTypeToStorage,
    saveProvidersToStorage,
    clearState,
  };
}
