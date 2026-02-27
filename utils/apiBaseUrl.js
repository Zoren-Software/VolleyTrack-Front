/**
 * Utilitário centralizado para obter a URL base da API.
 * Prioridade: window.__NUXT__ (runtime config) > process.env > fallback.
 * Remove trailing slash para consistência.
 *
 * Use em serviços que não têm acesso ao useRuntimeConfig().
 * Em componentes Vue, prefira useRuntimeConfig().public.apiEndpoint.
 */

const DEFAULT_API_URL = 'http://api.volleytrack.local'

/**
 * Obtém a URL base da API para uso em serviços (fetch, etc.)
 * @returns {string} URL base sem trailing slash
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    // Nuxt 3: runtime config disponível no cliente
    const nuxt = window.__NUXT__
    const apiEndpoint =
      nuxt?.config?.public?.apiEndpoint ||
      nuxt?.runtimeConfig?.public?.apiEndpoint
    if (apiEndpoint && typeof apiEndpoint === 'string') {
      return apiEndpoint.replace(/\/$/, '')
    }
  }
  // Fallback em build/SSR (process.env é substituído em tempo de build pelo Vite)
  const fromEnv =
    process.env.NUXT_PUBLIC_API_ENDPOINT || process.env.API_ENDPOINT
  if (fromEnv && typeof fromEnv === 'string') {
    return fromEnv.replace(/\/$/, '')
  }
  return DEFAULT_API_URL.replace(/\/$/, '')
}
