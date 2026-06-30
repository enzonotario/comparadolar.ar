const STORAGE_KEY = "comparadolar-show-only-24x7";

export const use24x7Filter = () => {
  const showOnly24x7 = useState<boolean>("showOnly24x7", () => false);
  const hydrated = useState<boolean>("showOnly24x7-hydrated", () => false);
  const { marketMode } = useMarketMode();

  const hasStoredPreference = () => {
    if (!import.meta.client) return false;
    return localStorage.getItem(STORAGE_KEY) !== null;
  };

  const hydratePreference = () => {
    if (!import.meta.client || hydrated.value) return;
    hydrated.value = true;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      showOnly24x7.value = stored === "true";
      return;
    }

    showOnly24x7.value = marketMode.value !== "normal";
  };

  onMounted(hydratePreference);

  watch(marketMode, (newMode) => {
    if (hasStoredPreference()) return;
    showOnly24x7.value = newMode !== "normal";
  });

  const showOnly24x7Model = computed({
    get: () => showOnly24x7.value,
    set: (value: boolean) => {
      showOnly24x7.value = value;
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, String(value));
      }
    },
  });

  return {
    showOnly24x7: showOnly24x7Model,
  };
};
