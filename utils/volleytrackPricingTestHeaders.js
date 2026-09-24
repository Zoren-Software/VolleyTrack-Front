import { getVolleytrackGeoCountrySync } from "./volleytrackGeoIp.js";

/**
 * Headers opcionais para o backend (ex.: checkout) refletirem países “simulados” no metadata Stripe.
 * Mesma prioridade que getApiBaseUrl: window.__NUXT__ no cliente, senão env em build.
 * Se não houver override no .env, usa país inferido por IP (após fetchVolleytrackGeoCountryOnce).
 */
function resolveVolleytrackForcedCountries() {
  const norm = (v) => {
    const s = String(v ?? "").trim().toUpperCase();
    return s.length >= 2 ? s.slice(0, 2) : "";
  };

  let ipCountry = "";
  let billingCountry = "";

  if (typeof window !== "undefined") {
    const nuxt = window.__NUXT__;
    const pub = nuxt?.config?.public || nuxt?.runtimeConfig?.public || {};
    ipCountry = norm(pub.volleytrackForcePricingIpCountry);
    billingCountry = norm(pub.volleytrackForcePricingBillingCountry);
  }

  if (!ipCountry) {
    ipCountry = norm(process.env.NUXT_PUBLIC_VOLLEYTRACK_FORCE_PRICING_IP_COUNTRY);
  }
  if (!billingCountry) {
    billingCountry = norm(
      process.env.NUXT_PUBLIC_VOLLEYTRACK_FORCE_PRICING_BILLING_COUNTRY,
    );
  }

  const geo = getVolleytrackGeoCountrySync();
  const geoNorm = geo ? norm(geo) : "";
  if (!ipCountry && geoNorm) {
    ipCountry = geoNorm;
  }
  if (!billingCountry && geoNorm) {
    billingCountry = geoNorm;
  }

  return { ipCountry, billingCountry };
}

export function getVolleytrackPricingTestHeaders() {
  const { ipCountry, billingCountry } = resolveVolleytrackForcedCountries();
  const headers = {};
  if (ipCountry) {
    headers["X-Volleytrack-Test-Ip-Country"] = ipCountry;
  }
  if (billingCountry) {
    headers["X-Volleytrack-Test-Billing-Country"] = billingCountry;
  }
  return headers;
}

/** Campos JSON opcionais (fallback se headers forem bloqueados ou ausentes no request). */
export function getVolleytrackDeclaredPricingBodyFields() {
  const { ipCountry, billingCountry } = resolveVolleytrackForcedCountries();
  const out = {};
  if (ipCountry) {
    out.declared_ip_country = ipCountry;
  }
  if (billingCountry) {
    out.declared_billing_country = billingCountry;
  }
  return out;
}
