/**
 * País inferido por IP (rota Nitro /api/volleytrack/detect-ip-country).
 * Usado quando NUXT_PUBLIC_VOLLEYTRACK_FORCE_PRICING_* estão vazios.
 * Se a API falhar ou não houver ambiente browser, assume **BR** (BRL).
 */

const DEFAULT_GEO_COUNTRY = "BR";

let geoResolved = false;
let geoCode = /** @type {string|null} */ (null);
let inflight = /** @type {Promise<string|null>|null} */ (null);

function normalize2(v) {
  const s = String(v ?? "")
    .trim()
    .toUpperCase();
  return s.length >= 2 ? s.slice(0, 2) : null;
}

/**
 * @param {typeof import('ofetch').$fetch} [$fetch]
 * @returns {Promise<string|null>}
 */
export async function fetchVolleytrackGeoCountryOnce($fetch) {
  if (geoResolved) {
    return geoCode;
  }
  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    try {
      let payload;
      if (typeof $fetch === "function") {
        payload = await $fetch("/api/volleytrack/detect-ip-country");
      } else if (typeof window !== "undefined" && window.location?.origin) {
        const res = await fetch(
          `${window.location.origin}/api/volleytrack/detect-ip-country`,
          { credentials: "same-origin" },
        );
        payload = await res.json();
      } else {
        geoResolved = true;
        geoCode = DEFAULT_GEO_COUNTRY;

        return geoCode;
      }
      const cc = normalize2(payload?.countryCode) ?? DEFAULT_GEO_COUNTRY;
      geoResolved = true;
      geoCode = cc;

      return geoCode;
    } catch {
      geoResolved = true;
      geoCode = DEFAULT_GEO_COUNTRY;

      return geoCode;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Código ISO2 após lookup; antes do primeiro fetch retorna null. Depois do fetch, nunca null (fallback BR). */
export function getVolleytrackGeoCountrySync() {
  if (!geoResolved) {
    return null;
  }

  return geoCode ?? DEFAULT_GEO_COUNTRY;
}

/** Para testes ou hidratação: fixar cache manualmente. */
export function resetVolleytrackGeoCacheForTests() {
  geoResolved = false;
  geoCode = null;
  inflight = null;
}
