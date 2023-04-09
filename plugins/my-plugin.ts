export default defineNuxtPlugin(() => {
    addRouteMiddleware('global-middleware', (to, from) => {
        const { getToken } = useApollo()
        const tokenPromise = getToken()

        tokenPromise.then((token) => {
            if (token === null) {
                console.log('token is null')
                return navigateTo('/login')
            }
            return navigateTo('/')
        })
      },
      { global: true }
    )
  })
  