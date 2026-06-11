import type { CurrencyType } from "~/lib/types";
import { currencies } from "~/lib/currencies-config";
import {
  isBlacklistedProviderSlug,
  isUsdCclProvider,
  toApiCurrency,
} from "~/lib/market-constants";
import { API_BASE_URL } from "~/lib/types";
import { getProviderDisplayName } from "~/lib/provider-display";

const STORAGE_KEY = "comparadolar:top3-notifications";
const LAST_TOP3_KEY = "comparadolar:last-top3";

export type Top3NotificationMode = "buy" | "sell" | "both";

interface Top3NotificationPreferences {
  enabled: boolean;
  currencies: CurrencyType[];
  notifyOn: Top3NotificationMode;
}

interface NormalizedRate {
  slug: string;
  name: string;
  ask: number;
  bid: number;
}

interface Top3Entry {
  slug: string;
  name: string;
  value: number;
}

interface CurrencyTop3 {
  buy: Top3Entry[];
  sell: Top3Entry[];
}

const DEFAULT_PREFERENCES: Top3NotificationPreferences = {
  enabled: false,
  currencies: ["usd"],
  notifyOn: "both",
};

function toPlainPreferences(
  preferences: Top3NotificationPreferences,
): Top3NotificationPreferences {
  return {
    enabled: Boolean(preferences.enabled),
    currencies: [...preferences.currencies],
    notifyOn: preferences.notifyOn,
  };
}

function normalizeRate(raw: any): NormalizedRate {
  const slug = raw?.slug || raw?.name || raw?.prettyName || "";

  return {
    slug,
    name: getProviderDisplayName({
      slug,
      prettyName: raw?.prettyName || raw?.name || slug || "Proveedor",
      name: raw?.name,
    }),
    ask: Number(raw?.ask ?? raw?.totalAsk ?? 0),
    bid: Number(raw?.bid ?? raw?.totalBid ?? 0),
  };
}

function asRateList(payload: unknown): NormalizedRate[] {
  if (Array.isArray(payload)) return payload.map(normalizeRate);

  if (payload && typeof payload === "object") {
    return Object.entries(payload).map(([name, raw]) => {
      const value = raw && typeof raw === "object" ? raw : {};
      return normalizeRate({ name, ...(value as Record<string, unknown>) });
    });
  }

  return [];
}

function top3For(rates: NormalizedRate[]): CurrencyTop3 {
  const validRates = rates.filter((rate) => rate.slug && rate.ask && rate.bid);

  return {
    buy: [...validRates]
      .sort((a, b) => a.ask - b.ask)
      .slice(0, 3)
      .map((rate) => ({ slug: rate.slug, name: rate.name, value: rate.ask })),
    sell: [...validRates]
      .sort((a, b) => b.bid - a.bid)
      .slice(0, 3)
      .map((rate) => ({ slug: rate.slug, name: rate.name, value: rate.bid })),
  };
}

function top3Slugs(entries: Array<string | Top3Entry>) {
  return entries.map((entry) =>
    typeof entry === "string" ? entry : entry.slug,
  );
}

function signature(top3: CurrencyTop3) {
  return `buy:${top3Slugs(top3.buy).join(",")}|sell:${top3Slugs(top3.sell).join(",")}`;
}

function isUsdCclRate(rate: NormalizedRate) {
  const slug = rate.slug.toLowerCase();
  const name = rate.name.toLowerCase();
  return isUsdCclProvider({ slug, name });
}

function describeChange(
  previous: CurrencyTop3,
  next: CurrencyTop3,
  notifyOn: Top3NotificationMode,
) {
  const changedBuy =
    top3Slugs(previous.buy).join(",") !== top3Slugs(next.buy).join(",");
  const changedSell =
    top3Slugs(previous.sell).join(",") !== top3Slugs(next.sell).join(",");

  if (notifyOn === "buy" && !changedBuy) return null;
  if (notifyOn === "sell" && !changedSell) return null;
  if (notifyOn === "both" && !changedBuy && !changedSell) return null;

  if (changedBuy && changedSell) return "cambió el top 3 de compra y venta";
  if (changedBuy) return "cambió el top 3 de compra";
  return "cambió el top 3 de venta";
}

function loadPreferences(): Top3NotificationPreferences {
  if (!import.meta.client) return DEFAULT_PREFERENCES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;

    return {
      ...DEFAULT_PREFERENCES,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function savePreferences(preferences: Top3NotificationPreferences) {
  if (!import.meta.client) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function loadLastTop3(): Record<string, CurrencyTop3> {
  if (!import.meta.client) return {};

  try {
    return JSON.parse(localStorage.getItem(LAST_TOP3_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLastTop3(value: Record<string, CurrencyTop3>) {
  if (!import.meta.client) return;
  localStorage.setItem(LAST_TOP3_KEY, JSON.stringify(value));
}

function formatQuote(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTop3Rows(top3: CurrencyTop3) {
  const buyRows = top3.buy.map(
    (entry, index) =>
      `${index + 1}. ${entry.name || entry.slug}: $${formatQuote(entry.value)}`,
  );
  const sellRows = top3.sell.map(
    (entry, index) =>
      `${index + 1}. ${entry.name || entry.slug}: $${formatQuote(entry.value)}`,
  );

  return [`Compras a:`, ...buyRows, `Vendes a:`, ...sellRows].join("\n");
}

async function showTop3Notification(
  currency: CurrencyType,
  message: string,
  top3: CurrencyTop3,
) {
  const label =
    currencies.find((item) => item.value === currency)?.label ??
    currency.toUpperCase();
  const url = currency === "usd" ? "/" : `/${currency}`;
  const options: NotificationOptions = {
    body: `${label}: ${message}.\n${formatTop3Rows(top3)}`,
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/favicon.png",
    tag: `top3-${currency}`,
    renotify: true,
    data: { url },
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(`Top 3 ${label} actualizado`, options);
    return;
  }

  new Notification(`Top 3 ${label} actualizado`, options);
}

async function showTestNotification() {
  if (Notification.permission !== "granted") return false;

  const options: NotificationOptions = {
    body: "Las alertas del Top 3 están funcionando correctamente.",
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/favicon.png",
    tag: "top3-test",
    renotify: true,
    data: { url: "/" },
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("Prueba de ComparaDólar", options);
    return true;
  }

  new Notification("Prueba de ComparaDólar", options);
  return true;
}

async function postPreferencesToServiceWorker(
  preferences: Top3NotificationPreferences,
) {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({
    type: "COMPARADOLAR_UPDATE_TOP3_PREFERENCES",
    preferences,
  });
}

async function requestPeriodicSync() {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  if (!("periodicSync" in registration)) return;

  try {
    await (registration as any).periodicSync.register("comparadolar-top3", {
      minInterval: 5 * 60 * 1000,
    });
  } catch {
    // API experimental: puede no estar disponible o no tener permiso.
  }
}

export function useTop3Notifications() {
  const preferences = useState<Top3NotificationPreferences>(
    "top3-notifications:preferences",
    () => DEFAULT_PREFERENCES,
  );
  const permission = useState<NotificationPermission>(
    "top3-notifications:permission",
    () => "default",
  );
  const isChecking = useState("top3-notifications:is-checking", () => false);
  const lastCheckAt = useState<string | null>(
    "top3-notifications:last-check-at",
    () => null,
  );

  const supportsNotifications = computed(
    () => import.meta.client && "Notification" in window,
  );

  const enabledCurrencies = computed(
    () => new Set(preferences.value.currencies),
  );

  const syncPreferences = async () => {
    const plainPreferences = toPlainPreferences(preferences.value);
    savePreferences(plainPreferences);
    if (supportsNotifications.value) {
      await postPreferencesToServiceWorker(plainPreferences);
    }
  };

  const fetchCurrencyTop3 = async (
    currency: CurrencyType,
  ): Promise<CurrencyTop3> => {
    const apiCurrency = toApiCurrency(currency);
    const payload = await $fetch<unknown>(`${API_BASE_URL}/${apiCurrency}`);
    let rates = asRateList(payload).filter(
      (rate) => !isBlacklistedProviderSlug(rate),
    );

    if (currency === "usd") {
      rates = rates.filter((rate) => !isUsdCclRate(rate));
    } else if (currency === "usd-ccl") {
      rates = rates.filter(isUsdCclRate);
    }

    return top3For(rates);
  };

  const checkNow = async (
    options: { notify?: boolean; ignoreEnabled?: boolean } = {},
  ) => {
    const { notify = true, ignoreEnabled = false } = options;

    if (!ignoreEnabled && !preferences.value.enabled) {
      return { checked: 0, changed: 0 };
    }
    if (notify && permission.value !== "granted") {
      return { checked: 0, changed: 0 };
    }
    if (isChecking.value) return { checked: 0, changed: 0 };

    isChecking.value = true;

    try {
      const previousByCurrency = loadLastTop3();
      const nextByCurrency = { ...previousByCurrency };

      const results = await Promise.all(
        preferences.value.currencies.map(async (currency) => {
          const nextTop3 = await fetchCurrencyTop3(currency);
          const previousTop3 = previousByCurrency[currency];
          nextByCurrency[currency] = nextTop3;

          if (
            !previousTop3 ||
            signature(previousTop3) === signature(nextTop3)
          ) {
            return { changed: false };
          }

          const message = describeChange(
            previousTop3,
            nextTop3,
            preferences.value.notifyOn,
          );

          if (notify && message)
            await showTop3Notification(currency, message, nextTop3);
          return { changed: Boolean(message) };
        }),
      );

      saveLastTop3(nextByCurrency);
      lastCheckAt.value = new Date().toISOString();

      return {
        checked: results.length,
        changed: results.filter((result) => result.changed).length,
      };
    } finally {
      isChecking.value = false;
    }
  };

  const requestPermission = async () => {
    if (!supportsNotifications.value) return "denied" as NotificationPermission;

    const result = await Notification.requestPermission();
    permission.value = result;

    if (result === "granted") {
      preferences.value = {
        ...preferences.value,
        enabled: true,
      };
      await syncPreferences();
      await requestPeriodicSync();
      await checkNow({ notify: false });
    }

    return result;
  };

  const setEnabled = async (enabled: boolean) => {
    if (enabled && permission.value !== "granted") {
      await requestPermission();
      return;
    }

    preferences.value = {
      ...preferences.value,
      enabled,
    };
    await syncPreferences();

    if (enabled) await checkNow({ notify: false });
  };

  const toggleCurrency = async (currency: CurrencyType) => {
    const selected = new Set(preferences.value.currencies);

    if (selected.has(currency)) {
      selected.delete(currency);
    } else {
      selected.add(currency);
    }

    preferences.value = {
      ...preferences.value,
      currencies: Array.from(selected),
    };
    await syncPreferences();
    await checkNow({ notify: false });
  };

  const setNotifyOn = async (notifyOn: Top3NotificationMode) => {
    preferences.value = {
      ...preferences.value,
      notifyOn,
    };
    await syncPreferences();
  };

  if (import.meta.client) {
    onMounted(() => {
      preferences.value = loadPreferences();
      permission.value = supportsNotifications.value
        ? Notification.permission
        : "denied";
      void syncPreferences();
    });

    const { registerAutoRefreshHandler } = useAutoRefresh();
    let unregisterAutoRefreshHandler: (() => void) | undefined;

    onMounted(() => {
      unregisterAutoRefreshHandler = registerAutoRefreshHandler(
        "top3-notifications",
        () => checkNow(),
      );
    });

    onUnmounted(() => {
      unregisterAutoRefreshHandler?.();
    });
  }

  return {
    preferences,
    permission: readonly(permission),
    supportsNotifications,
    enabledCurrencies,
    isChecking: readonly(isChecking),
    lastCheckAt: readonly(lastCheckAt),
    requestPermission,
    setEnabled,
    toggleCurrency,
    setNotifyOn,
    checkNow,
    sendTestNotification: showTestNotification,
  };
}
