export const use24x7Filter = () => {
  const showOnly24x7 = useState<boolean>("showOnly24x7", () => false);
  const { marketMode } = useMarketMode();

  watch(
    marketMode,
    (newMode) => {
      if (newMode !== "normal") {
        showOnly24x7.value = true;
      } else {
        showOnly24x7.value = false;
      }
    },
    { immediate: true },
  );

  return {
    showOnly24x7,
  };
};
