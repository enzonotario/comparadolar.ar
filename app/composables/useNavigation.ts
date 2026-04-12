import type { CurrencyType } from "@/lib/types";
import { getCurrencyRoute as getBaseCurrencyRoute } from "@/lib/currencies-config";

export function useNavigation() {
  const route = useRoute();

  const getSectionPrefix = (section: string): string => {
    switch (section) {
      case "compare":
        return "";
      case "terminal":
        return "/terminal";
      case "charts":
        return "/graficos";
      default:
        return "";
    }
  };

  const getCurrencyRoute = (currency: CurrencyType): string => {
    const baseRoute = getBaseCurrencyRoute(currency);
    return baseRoute;
  };

  const getFullRoute = (section: string, currency: CurrencyType): string => {
    const sectionPrefix = getSectionPrefix(section);
    const currencyRoute = getCurrencyRoute(currency);

    // Si es la sección de comparar, solo usar la ruta de la moneda
    if (section === "compare") {
      return currencyRoute;
    }

    // Para otras secciones, combinar el prefijo con la ruta de la moneda
    if (currencyRoute === "/") {
      return sectionPrefix;
    }

    return `${sectionPrefix}${currencyRoute}`;
  };

  const getCurrentSection = (): string => {
    const currentPath = route.path;

    if (currentPath.startsWith("/terminal")) {
      return "terminal";
    }
    if (currentPath.startsWith("/graficos")) {
      return "charts";
    }
    return "compare";
  };

  const getCurrentCurrency = (): CurrencyType => {
    const currentPath = route.path;

    // Extraer la moneda de la ruta actual
    const pathParts = currentPath.split("/").filter(Boolean);

    // Si la ruta es solo "/", es USD
    if (currentPath === "/") {
      return "usd";
    }

    // Si la ruta tiene prefijo de sección, tomar la segunda parte
    if (pathParts[0] === "terminal" || pathParts[0] === "graficos") {
      const currency = pathParts[1];
      return (currency as CurrencyType) || "usd";
    }

    // Si no tiene prefijo, la primera parte es la moneda
    const currency = pathParts[0];
    return (currency as CurrencyType) || "usd";
  };

  return {
    getSectionPrefix,
    getCurrencyRoute,
    getFullRoute,
    getCurrentSection,
    getCurrentCurrency,
  };
}
