import type { MaybeRefOrGetter } from "vue";
import { toValue } from "vue";

const DEFAULT_AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_AUTO_REFRESH_SECONDS = DEFAULT_AUTO_REFRESH_INTERVAL_MS / 1000;

type AutoRefreshHandler = () => Promise<void> | void;

const handlers = new Map<string, AutoRefreshHandler>();
let timer: ReturnType<typeof setInterval> | undefined;
let consumers = 0;
let activeRefresh: Promise<void> | undefined;
let visibilityListenerRegistered = false;
let handlerId = 0;

interface UseAutoRefreshOptions {
  intervalMs?: MaybeRefOrGetter<number>;
}

function getIntervalMs(intervalMs?: MaybeRefOrGetter<number>) {
  const value = intervalMs
    ? toValue(intervalMs)
    : DEFAULT_AUTO_REFRESH_INTERVAL_MS;
  return Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_AUTO_REFRESH_INTERVAL_MS;
}

export function useAutoRefresh(options: UseAutoRefreshOptions = {}) {
  const route = useRoute();
  const secondsLeft = useState(
    "auto-refresh:seconds-left",
    () => DEFAULT_AUTO_REFRESH_SECONDS,
  );
  const isRefreshing = useState("auto-refresh:is-refreshing", () => false);
  const isPaused = useState("auto-refresh:is-paused", () => false);
  const nextRefreshAt = useState(
    "auto-refresh:next-refresh-at",
    () => Date.now() + getIntervalMs(options.intervalMs),
  );
  const lastRefreshAt = useState<string | null>(
    "auto-refresh:last-refresh-at",
    () => null,
  );

  const intervalSeconds = computed(() =>
    Math.ceil(getIntervalMs(options.intervalMs) / 1000),
  );

  const updateSecondsLeft = () => {
    secondsLeft.value = Math.max(
      0,
      Math.ceil((nextRefreshAt.value - Date.now()) / 1000),
    );
  };

  const resetCountdown = () => {
    nextRefreshAt.value = Date.now() + getIntervalMs(options.intervalMs);
    updateSecondsLeft();
  };

  const refreshNow = async () => {
    if (activeRefresh) return activeRefresh;

    isRefreshing.value = true;
    activeRefresh = (async () => {
      const results = await Promise.allSettled([
        refreshNuxtData(),
        ...Array.from(handlers.values(), async (handler) => handler()),
      ]);
      const failed = results.find((result) => result.status === "rejected");

      if (failed) {
        console.error("Error al auto-actualizar datos:", failed.reason);
      }

      lastRefreshAt.value = new Date().toISOString();
      resetCountdown();
    })().finally(() => {
      isRefreshing.value = false;
      activeRefresh = undefined;
    });

    return activeRefresh;
  };

  const tick = () => {
    if (!import.meta.client) return;
    isPaused.value = document.visibilityState === "hidden";
    if (isPaused.value || isRefreshing.value) return;

    updateSecondsLeft();

    if (secondsLeft.value <= 0) {
      void refreshNow();
    }
  };

  const start = () => {
    if (!import.meta.client || timer) return;

    if (!visibilityListenerRegistered) {
      document.addEventListener("visibilitychange", () => {
        isPaused.value = document.visibilityState === "hidden";
        if (!isPaused.value) updateSecondsLeft();
      });
      visibilityListenerRegistered = true;
    }

    resetCountdown();
    timer = setInterval(tick, 1000);
  };

  const stop = () => {
    if (!timer) return;
    clearInterval(timer);
    timer = undefined;
  };

  const registerAutoRefreshHandler = (
    keyOrHandler: string | AutoRefreshHandler,
    maybeHandler?: AutoRefreshHandler,
  ) => {
    const key =
      typeof keyOrHandler === "string"
        ? keyOrHandler
        : `auto-refresh-handler:${++handlerId}`;
    const handler =
      typeof keyOrHandler === "string" ? maybeHandler : keyOrHandler;

    if (!handler) {
      throw new Error("registerAutoRefreshHandler requires a handler");
    }

    handlers.set(key, handler);
    return () => handlers.delete(key);
  };

  const progress = computed(() => {
    if (intervalSeconds.value <= 0) return 0;
    return Math.min(
      100,
      Math.max(0, (secondsLeft.value / intervalSeconds.value) * 100),
    );
  });

  if (import.meta.client) {
    onMounted(() => {
      consumers += 1;
      start();
    });

    onUnmounted(() => {
      consumers = Math.max(0, consumers - 1);
      if (consumers === 0) stop();
    });

    watch(
      () => route.fullPath,
      () => resetCountdown(),
    );
  }

  return {
    secondsLeft: readonly(secondsLeft),
    isRefreshing: readonly(isRefreshing),
    isPaused: readonly(isPaused),
    lastRefreshAt: readonly(lastRefreshAt),
    intervalSeconds,
    progress,
    refreshNow,
    resetCountdown,
    registerAutoRefreshHandler,
  };
}
