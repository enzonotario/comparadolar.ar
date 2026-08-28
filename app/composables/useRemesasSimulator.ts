export function useRemesasSimulator() {
  const usdAmount = useState<number | null>(
    "remesas-simulator-amount",
    () => 1000,
  );

  const isSimulating = computed(
    () => usdAmount.value != null && usdAmount.value >= 1,
  );

  function clearSimulator() {
    usdAmount.value = null;
  }

  return {
    usdAmount,
    isSimulating,
    clearSimulator,
  };
}
