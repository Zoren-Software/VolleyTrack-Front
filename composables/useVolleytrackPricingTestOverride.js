import { fetchVolleytrackGeoCountryOnce } from "~/utils/volleytrackGeoIp.js";

const DEFAULT_PRICING_COUNTRY = "BR";

/**
 * Sobrescreve país de exibição/preço (UI) e envio opcional para o backend em testes locais.
 *
 * .env (Nuxt público):
 *   NUXT_PUBLIC_VOLLEYTRACK_FORCE_PRICING_IP_COUNTRY=US
 *   NUXT_PUBLIC_VOLLEYTRACK_FORCE_PRICING_BILLING_COUNTRY=BR
 *
 * Prioridade: variável de ambiente > query ?ip_country= na rota > país pelo IP (API interna).
 */
export function useVolleytrackPricingTestOverride() {
  const runtimeConfig = useRuntimeConfig();
  const route = useRoute();
  const nuxtApp = useNuxtApp();

  const normalize2 = (value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }
    const s = String(value).trim().toUpperCase();
    return s.length >= 2 ? s.slice(0, 2) : null;
  };

  const forcedIpCountry = computed(() =>
    normalize2(runtimeConfig.public.volleytrackForcePricingIpCountry),
  );

  const forcedBillingCountry = computed(() =>
    normalize2(runtimeConfig.public.volleytrackForcePricingBillingCountry),
  );

  const skipGeoLookup = computed(
    () =>
      Boolean(forcedIpCountry.value) || Boolean(forcedBillingCountry.value),
  );

  const { data: geoLookup } = useAsyncData(
    "volleytrack-detect-ip-country",
    async () => {
      if (skipGeoLookup.value) {
        return { countryCode: null, skipped: true };
      }
      const code = await fetchVolleytrackGeoCountryOnce(nuxtApp.$fetch);

      return { countryCode: code, skipped: false };
    },
    { server: false, lazy: false },
  );

  const geoIpCountry = computed(() => {
    if (geoLookup.value?.skipped) {
      return null;
    }

    return normalize2(geoLookup.value?.countryCode);
  });

  const isPricingOverrideActive = computed(
    () =>
      Boolean(forcedIpCountry.value || forcedBillingCountry.value) ||
      !skipGeoLookup.value,
  );

  /**
   * País usado em GET /v1/products?ip_country= (prévia regional na listagem).
   */
  const effectivePricingIpCountry = computed(() => {
    if (forcedIpCountry.value) {
      return forcedIpCountry.value;
    }
    const q = route.query.ip_country;
    const fromQuery = normalize2(q);
    if (fromQuery) {
      return fromQuery;
    }

    const g = geoIpCountry.value;
    if (g) {
      return g;
    }
    if (skipGeoLookup.value) {
      return null;
    }

    return DEFAULT_PRICING_COUNTRY;
  });

  /** País de cobrança exibido na UI quando não há override explícito no .env. */
  const effectivePricingBillingCountry = computed(() => {
    if (forcedBillingCountry.value) {
      return forcedBillingCountry.value;
    }

    const g = geoIpCountry.value;
    if (g) {
      return g;
    }
    if (skipGeoLookup.value) {
      return null;
    }

    return DEFAULT_PRICING_COUNTRY;
  });

  return {
    forcedIpCountry,
    forcedBillingCountry,
    geoIpCountry,
    isPricingOverrideActive,
    effectivePricingIpCountry,
    effectivePricingBillingCountry,
    normalize2,
  };
}
