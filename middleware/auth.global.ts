
export default defineNuxtRouteMiddleware((to, from, next) => {
//   if (process.client) {
    const { getToken } = useApollo()
    const tokenPromise = getToken()

    tokenPromise.then((token) => {
        if (token === null) {
            //return abortNavigation('Você não esta logado.')
        }
    })
//   }
})