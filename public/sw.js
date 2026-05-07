/// <reference lib="webworker" />

const CACHE_NAME = "comparadolar-pwa-v2";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/market-constants.json",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/favicon.png",
];
const API_BASE_URL = "https://api.comparadolar.ar";
const DEFAULT_PREFERENCES = {
  enabled: false,
  currencies: [],
  notifyOn: "both",
};
let marketConstantsPromise;
const DB_NAME = "comparadolar-pwa";
const DB_VERSION = 1;
const STORE_NAME = "kv";

let preferences = { ...DEFAULT_PREFERENCES };
let top3Interval;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getMarketConstants() {
  if (!marketConstantsPromise) {
    marketConstantsPromise = fetch("/market-constants.json", {
      cache: "no-store",
    })
      .then((response) => response.json())
      .catch((error) => {
        marketConstantsPromise = undefined;
        throw error;
      });
  }

  return marketConstantsPromise;
}

function toApiCurrency(currency, constants) {
  return constants.apiCurrencyAliases?.[currency] || currency;
}

function isUsdCclRate(rate, constants) {
  const usdCclProviders = new Set(constants.providerGroups?.usdCcl || []);
  return usdCclProviders.has(rate.slug.toLowerCase());
}

function normalizeRate(raw) {
  return {
    slug: raw?.slug || raw?.name || raw?.prettyName || "",
    name: raw?.prettyName || raw?.name || raw?.slug || "Proveedor",
    ask: Number(raw?.ask ?? raw?.totalAsk ?? 0),
    bid: Number(raw?.bid ?? raw?.totalBid ?? 0),
  };
}

function asRateList(payload) {
  if (Array.isArray(payload)) return payload.map(normalizeRate);
  if (payload && typeof payload === "object") {
    return Object.entries(payload).map(([name, raw]) => {
      const value = raw && typeof raw === "object" ? raw : {};
      return normalizeRate({ name, ...value });
    });
  }
  return [];
}

function top3For(payload) {
  const rates = asRateList(payload).filter(
    (rate) => rate.slug && rate.ask && rate.bid,
  );
  const buy = [...rates]
    .sort((a, b) => a.ask - b.ask)
    .slice(0, 3)
    .map((rate) => rate.slug);
  const sell = [...rates]
    .sort((a, b) => b.bid - a.bid)
    .slice(0, 3)
    .map((rate) => rate.slug);

  return { buy, sell };
}

function signature(top3) {
  return `buy:${top3.buy.join(",")}|sell:${top3.sell.join(",")}`;
}

function describeChange(previous, next, notifyOn) {
  const changedBuy = previous.buy.join(",") !== next.buy.join(",");
  const changedSell = previous.sell.join(",") !== next.sell.join(",");

  if (notifyOn === "buy" && !changedBuy) return null;
  if (notifyOn === "sell" && !changedSell) return null;
  if (notifyOn === "both" && !changedBuy && !changedSell) return null;

  if (changedBuy && changedSell) return "cambió el top 3 de compra y venta";
  if (changedBuy) return "cambió el top 3 de compra";
  return "cambió el top 3 de venta";
}

async function fetchTop3(currency) {
  const constants = await getMarketConstants();
  const apiCurrency = toApiCurrency(currency, constants);
  const response = await fetch(`${API_BASE_URL}/${apiCurrency}`, {
    cache: "no-store",
  });
  const payload = await response.json();

  if (currency !== "usd" && currency !== "usd-ccl") return top3For(payload);

  const filtered = asRateList(payload).filter((rate) => {
    const isCcl = isUsdCclRate(rate, constants);
    return currency === "usd-ccl" ? isCcl : !isCcl;
  });

  return top3For(filtered);
}

function formatTop3Rows(top3) {
  const buyRows = top3.buy.map((slug, index) => `${index + 1}. ${slug}`);
  const sellRows = top3.sell.map((slug, index) => `${index + 1}. ${slug}`);

  return [`Compra:`, ...buyRows, `Venta:`, ...sellRows].join("\n");
}

async function notifyTop3Change(currency, message, top3) {
  if (Notification.permission !== "granted") return;

  const constants = await getMarketConstants();
  const label = constants.currencyLabels?.[currency] || currency.toUpperCase();
  await self.registration.showNotification(`Top 3 ${label} actualizado`, {
    body: `${label}: ${message}.\n${formatTop3Rows(top3)}`,
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/favicon.png",
    tag: `top3-${currency}`,
    renotify: true,
    data: {
      url: currency === "usd" ? "/" : `/${currency}`,
    },
  });
}

async function checkTop3Changes({ notify = true } = {}) {
  const currentPreferences = (await dbGet("preferences")) || preferences;
  preferences = { ...DEFAULT_PREFERENCES, ...currentPreferences };

  if (!preferences.enabled || Notification.permission !== "granted") return;

  await Promise.all(
    preferences.currencies.map(async (currency) => {
      try {
        const nextTop3 = await fetchTop3(currency);
        const previousTop3 = await dbGet(`top3:${currency}`);
        await dbSet(`top3:${currency}`, nextTop3);

        if (!previousTop3 || signature(previousTop3) === signature(nextTop3))
          return;

        const message = describeChange(
          previousTop3,
          nextTop3,
          preferences.notifyOn || "both",
        );
        if (notify && message)
          await notifyTop3Change(currency, message, nextTop3);
      } catch (error) {
        console.error("Error checking top 3 changes", currency, error);
      }
    }),
  );
}

function scheduleTop3Checks() {
  if (top3Interval) clearInterval(top3Interval);
  if (!preferences.enabled) return;
  top3Interval = setInterval(
    () => {
      void checkTop3Changes();
    },
    5 * 60 * 1000,
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key !== CACHE_NAME)
              .map((key) => caches.delete(key)),
          ),
        ),
      self.clients.claim(),
      dbGet("preferences").then((saved) => {
        preferences = { ...DEFAULT_PREFERENCES, ...(saved || {}) };
        scheduleTop3Checks();
      }),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }

  if (url.pathname.startsWith("/_nuxt/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});

self.addEventListener("message", (event) => {
  const message = event.data || {};

  if (message.type === "COMPARADOLAR_UPDATE_TOP3_PREFERENCES") {
    preferences = { ...DEFAULT_PREFERENCES, ...(message.preferences || {}) };
    event.waitUntil(dbSet("preferences", preferences).then(scheduleTop3Checks));
  }

  if (message.type === "COMPARADOLAR_CHECK_TOP3") {
    event.waitUntil(checkTop3Changes({ notify: message.notify !== false }));
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "comparadolar-top3") {
    event.waitUntil(checkTop3Changes());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((client) => client.url === targetUrl);
        if (existing) return existing.focus();
        return self.clients.openWindow(targetUrl);
      }),
  );
});
