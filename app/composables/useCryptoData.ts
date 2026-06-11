import type {
  CryptoRatesResponse,
  NormalizedCryptoRate,
  CryptoType,
} from "@/lib/types";
import { API_ENDPOINTS } from "@/lib/types";
import { isCryptoCurrency } from "@/lib/market-constants";
import { applyProviderDisplayName } from "@/lib/provider-display";

const PROVIDER_OVERRIDES: Record<
  string,
  { prettyName: string; logo: string; url: string }
> = {
  dolarapp: {
    prettyName: "ARQ",
    logo: "https://api.argentinadatos.com/static/logos/arq.png",
    url: "http://arqfinance.com/?ref=comparadolar.ar",
  },
  arq: {
    prettyName: "ARQ",
    logo: "https://api.argentinadatos.com/static/logos/arq.png",
    url: "http://arqfinance.com/?ref=comparadolar.ar",
  },
};

function normalizeData(data: any): NormalizedCryptoRate[] {
  if (!data || typeof data !== "object") return [];

  return Object.entries(data).map(([key, item]: [string, any]) => {
    const override = PROVIDER_OVERRIDES[key.toLowerCase()];
    const rate: NormalizedCryptoRate = {
      name: key,
      slug: item.slug ?? key,
      bid: item.totalBid || 0,
      ask: item.totalAsk || 0,
      logo: override?.logo ?? item.logo ?? "",
      logoUrl: override?.logo ?? item.logo ?? "",
      is24x7: true,
      prettyName: override?.prettyName ?? item.prettyName ?? key,
      url: override?.url ?? item.url ?? "",
    };

    return applyProviderDisplayName(rate);
  });
}

export function useCryptoData(cryptoType: CryptoType) {
  const validType = isCryptoCurrency(cryptoType) ? cryptoType : "usdc";

  const url = API_ENDPOINTS[validType];
  const { data, error, isLoading, lastUpdate, refresh } =
    useDataFetching<CryptoRatesResponse>(url);

  const normalizedData = computed(() => normalizeData(data.value));

  return {
    data: normalizedData,
    error,
    isLoading,
    lastUpdate,
    refresh,
  };
}
