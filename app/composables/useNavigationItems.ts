export const useNavigationItems = () => {
  const { getCurrentSection, getFullRoute, getCurrentCurrency } =
    useNavigation();
  const { buildRouteWithState } = useTerminalState();

  const items = [
    {
      label: "Comparar",
      value: "compare",
      icon: "i-heroicons-arrows-up-down",
    },
    {
      label: "Terminal",
      value: "terminal",
      icon: "i-heroicons-computer-desktop",
    },
    {
      label: "Gráficos",
      value: "charts",
      icon: "i-heroicons-chart-bar",
    },
  ];

  const getSectionRoute = (section: string) => {
    const currentCurrency = getCurrentCurrency();
    const basePath = getFullRoute(section, currentCurrency);

    // Load saved state from localStorage when navigating to terminal section
    if (section === "terminal") {
      return buildRouteWithState(basePath, currentCurrency);
    }

    return basePath;
  };

  const isActive = (value: string) => {
    return getCurrentSection() === value;
  };

  const navigationItems = computed(() => {
    return items.map((item) => ({
      ...item,
      to: getSectionRoute(item.value),
      active: isActive(item.value),
    }));
  });

  return {
    items,
    navigationItems,
    getSectionRoute,
    isActive,
  };
};
