const STORAGE_KEY = "comparadolar-include-conditions";

export const useIncludeConditions = () => {
  const includeConditions = useState("include-conditions", () => true);
  const hydrated = useState("include-conditions-hydrated", () => false);

  const hydratePreference = () => {
    if (!import.meta.client || hydrated.value) return;
    hydrated.value = true;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      includeConditions.value = stored === "true";
    }
  };

  onMounted(hydratePreference);

  const includeConditionsModel = computed({
    get: () => includeConditions.value,
    set: (value: boolean) => {
      includeConditions.value = value;
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, String(value));
      }
    },
  });

  return {
    includeConditions: includeConditionsModel,
  };
};
