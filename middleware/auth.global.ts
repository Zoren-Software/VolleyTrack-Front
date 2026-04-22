function resolveBackendWebBase(config: ReturnType<typeof useRuntimeConfig>): string {
    const api = String(config.public.apiEndpoint || '').trim()
    if (!api) {
        return ''
    }
    return api.replace(/\/graphql\/?$/i, '').replace(/\/$/, '')
}

export default defineNuxtRouteMiddleware((to) => {
    // Links antigos apontam para {tenant}.domínio/verify-email/... no SPA; a rota real é no Laravel.
    const verifyMatch = to.path.match(/^\/verify-email\/([^/]+)\/([^/]+)\/?$/)
    if (verifyMatch) {
        const config = useRuntimeConfig()
        const base = resolveBackendWebBase(config)
        if (base) {
            const tenant = verifyMatch[1]
            const token = verifyMatch[2]
            return navigateTo(`${base}/verify-email/${encodeURIComponent(tenant)}/${encodeURIComponent(token)}`, {
                external: true,
            })
        }
    }

    const token = localStorage.getItem('apollo:default.token')

    const isSetPasswordRoute = to.path.startsWith('/set-password/') && to.params.email && to.params.token

    if (isSetPasswordRoute) {
        return
    }

    if (to.path !== '/login' && token == null) {
        localStorage.removeItem('apollo:default.token')
        return '/login'
    }

    if (to.path === '/login' && token != null) {
        return '/'
    }
})