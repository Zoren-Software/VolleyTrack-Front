import { defineNuxtPlugin } from '#app'
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'

export default defineNuxtPlugin(nuxtAppMain => {
  if(process.server) return
  const subdomain = window.location.hostname.split('.')[0] // Recuperar o subdomínio da URL

  const httpLink = new HttpLink({ uri: 'http://api.voleiclub.local/graphql' })

  const token = localStorage.getItem('userToken'); // Recuperar o token do localStorage

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        'x-tenant': subdomain,
        'Authorization': token ? `Bearer ${token}` : "", // Incluir o token no cabeçalho de autorização
      },
    }
  })

  const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  })
  
  const nuxtApp = useNuxtApp()
  nuxtApp._apolloClients.default = apolloClient
})