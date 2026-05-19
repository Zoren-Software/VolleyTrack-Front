import { defineEventHandler, getHeader, getRequestIP } from "h3";

/** Quando não dá para inferir país (ex.: localhost), usamos BR → listagem/preço BRL. */
const DEFAULT_PRICING_COUNTRY = "BR";

/** Timeout por tentativa (várias APIs em sequência). */
const GEO_FETCH_MS = 3200;

type GeoHit = { countryCode: string; source: string };

function isPrivateOrLocalIp(ip: string): boolean {
  const t = ip.trim().toLowerCase();
  if (!t || t === "::1") {
    return true;
  }
  if (t.startsWith("127.")) {
    return true;
  }
  if (t.startsWith("10.")) {
    return true;
  }
  if (t.startsWith("192.168.")) {
    return true;
  }
  const m = /^172\.(\d+)\./.exec(t);
  if (m) {
    const n = Number.parseInt(m[1], 10);
    if (n >= 16 && n <= 31) {
      return true;
    }
  }
  if (t.startsWith("fc") || t.startsWith("fd")) {
    return true;
  }

  return false;
}

function normalizeCountryCode(raw: string | undefined | null): string | null {
  if (!raw || typeof raw !== "string") {
    return null;
  }
  const u = raw.trim().toUpperCase().slice(0, 2);
  if (!/^[A-Z]{2}$/.test(u) || u === "XX") {
    return null;
  }

  return u;
}

function fallback(source: string) {
  return { countryCode: DEFAULT_PRICING_COUNTRY, source };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(GEO_FETCH_MS),
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`http_${res.status}`);
  }

  return res.json();
}

/** https://ipwho.is/docs — sem chave. */
async function tryIpwhoIs(ip: string): Promise<GeoHit | null> {
  const url = `https://ipwho.is/${encodeURIComponent(ip)}`;
  const data = (await fetchJson(url)) as {
    success?: boolean;
    country_code?: string;
  };
  if (data?.success && typeof data.country_code === "string") {
    const cc = normalizeCountryCode(data.country_code);

    return cc ? { countryCode: cc, source: "ipwhois" } : null;
  }

  return null;
}

/** https://www.geojs.io/ — sem chave. */
async function tryGeoJs(ip: string): Promise<GeoHit | null> {
  const url = `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`;
  const data = (await fetchJson(url)) as {
    country_code?: string;
    country?: string;
  };
  const cc =
    normalizeCountryCode(data?.country_code) ??
    (typeof data?.country === "string" && data.country.length === 2
      ? normalizeCountryCode(data.country)
      : null);

  return cc ? { countryCode: cc, source: "geojs" } : null;
}

/**
 * http://ip-api.com — plano gratuito (HTTP); campos mínimos.
 * @see https://ip-api.com/docs/
 */
async function tryIpApiCom(ip: string): Promise<GeoHit | null> {
  const enc = encodeURIComponent(ip);
  const url = `http://ip-api.com/json/${enc}?fields=status,message,countryCode`;
  const data = (await fetchJson(url)) as {
    status?: string;
    countryCode?: string;
    message?: string;
  };
  if (data?.status === "success" && typeof data.countryCode === "string") {
    const cc = normalizeCountryCode(data.countryCode);

    return cc ? { countryCode: cc, source: "ip-api-com" } : null;
  }

  return null;
}

/** https://ipapi.co/api/ — camada gratuita com limite de taxa. */
async function tryIpApiCo(ip: string): Promise<GeoHit | null> {
  const url = `https://ipapi.co/${encodeURIComponent(ip)}/json/`;
  const data = (await fetchJson(url)) as {
    country_code?: string;
    error?: boolean;
    reason?: string;
  };
  if (data?.error === true) {
    return null;
  }
  if (typeof data?.country_code === "string") {
    const cc = normalizeCountryCode(data.country_code);

    return cc ? { countryCode: cc, source: "ipapi-co" } : null;
  }

  return null;
}

/** https://country.is/ — JSON simples, sem chave (`country` = ISO2). */
async function tryCountryIs(ip: string): Promise<GeoHit | null> {
  const url = `https://api.country.is/${encodeURIComponent(ip)}`;
  const data = (await fetchJson(url)) as { country?: string };
  if (typeof data?.country === "string") {
    const cc = normalizeCountryCode(data.country);

    return cc ? { countryCode: cc, source: "country-is" } : null;
  }

  return null;
}

/**
 * País inferido para preços VolleyTrack quando o .env não força região.
 * Ordem: CF-IPCountry → várias APIs gratuitas (sequencial) → BR.
 */
export default defineEventHandler(async (event) => {
  const cfRaw =
    getHeader(event, "cf-ipcountry") ?? getHeader(event, "CF-IPCountry");
  const cf = normalizeCountryCode(cfRaw ?? null);
  if (cf) {
    return { countryCode: cf, source: "cf-ipcountry" };
  }

  const ip = (getRequestIP(event, { xForwardedFor: true }) ?? "").trim();
  if (!ip || isPrivateOrLocalIp(ip)) {
    return fallback("private-or-local-default-br");
  }

  const attempts: Array<() => Promise<GeoHit | null>> = [
    () => tryIpwhoIs(ip),
    () => tryGeoJs(ip),
    () => tryCountryIs(ip),
    () => tryIpApiCom(ip),
    () => tryIpApiCo(ip),
  ];

  for (const run of attempts) {
    try {
      const hit = await run();
      if (hit) {
        return hit;
      }
    } catch {
      /* tenta próximo provedor */
    }
  }

  return fallback("all-providers-failed-default-br");
});
