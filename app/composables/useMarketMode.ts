import { ref, computed, onMounted, onUnmounted } from "vue";

export type MarketMode = "normal" | "after" | "pre" | "weekend";

interface UseMarketModeOptions {
  debugMode?: boolean;
}

interface Holiday {
  fecha: string;
  nombre?: string;
}

export function useMarketMode({
  debugMode = false,
}: UseMarketModeOptions = {}) {
  const marketMode = ref<MarketMode>("normal");
  const lastCheck = ref(new Date());
  const forcedMode = ref(false);
  const holidays = ref<string[]>([]);

  const fetchHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `https://api.argentinadatos.com/v1/feriados/${currentYear}`,
      );

      if (!response.ok) {
        throw new Error("Error al obtener feriados");
      }

      const data: Holiday[] = await response.json();
      holidays.value = data.map((h) => h.fecha);

      if (debugMode) {
        console.log("📅 Feriados cargados:", holidays.value);
      }
    } catch (error) {
      console.error("Error al cargar feriados:", error);
      holidays.value = [
        "2025-01-01",
        "2025-03-03",
        "2025-03-04",
        "2025-04-02",
        "2025-04-17",
        "2025-04-18",
        "2025-05-01",
        "2025-05-25",
        "2025-06-20",
        "2025-07-09",
        "2025-08-17",
        "2025-10-12",
        "2025-12-08",
        "2025-12-25",
      ];
    }
  };

  const isHoliday = (date: Date): boolean => {
    const formattedDate = date.toISOString().split("T")[0];
    return holidays.value.includes(formattedDate);
  };

  const determineMarketMode = (): MarketMode => {
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay();

    if (isHoliday(now) && hours >= 8 && hours < 20) {
      if (debugMode) {
        console.log("🍺 Feriado detectado:", now.toISOString().split("T")[0]);
      }
      return "weekend";
    }

    if ((day === 0 || day === 6) && hours >= 8 && hours < 20) {
      return "weekend";
    }

    if (hours >= 17 || hours < 5) {
      return "after";
    }

    if (hours >= 5 && hours < 10) {
      return "pre";
    }

    return "normal";
  };

  const checkUrlParams = () => {
    if (typeof window === "undefined") return false;

    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get("mode");

    if (modeParam) {
      console.log("🔍 Modo forzado por URL:", modeParam);

      const validModes: MarketMode[] = ["after", "pre", "weekend", "normal"];
      const mode = modeParam.toLowerCase() as MarketMode;

      if (validModes.includes(mode)) {
        marketMode.value = mode;
        forcedMode.value = true;
        return true;
      }
    }
    return false;
  };

  let intervalId: NodeJS.Timeout | null = null;

  onMounted(async () => {
    await fetchHolidays();

    const isForcedByUrl = checkUrlParams();

    if (!isForcedByUrl) {
      marketMode.value = determineMarketMode();
      forcedMode.value = false;
    }

    lastCheck.value = new Date();

    intervalId = setInterval(() => {
      if (!forcedMode.value) {
        marketMode.value = determineMarketMode();
        lastCheck.value = new Date();

        if (debugMode) {
          console.log("🕒 Modo de mercado:", marketMode.value);
          console.log(
            "🔄 Última verificación:",
            lastCheck.value.toLocaleTimeString(),
          );
        }
      }
    }, 60000);
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  const isSpecialMode = computed(() => marketMode.value !== "normal");

  const isMarketOpen = computed(() => marketMode.value === "normal");

  const getMarketStatusText = computed(() => {
    switch (marketMode.value) {
      case "after":
        return "After Hours";
      case "pre":
        return "Pre Market";
      case "weekend":
        return "Weekend Mode";
      default:
        return "Mercado Abierto";
    }
  });

  return {
    marketMode,
    lastCheck,
    isSpecialMode,
    forcedMode,
    isMarketOpen,
    getMarketStatusText,
  };
}
