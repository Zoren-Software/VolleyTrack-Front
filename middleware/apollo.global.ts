import { defineNuxtPlugin } from '#app'
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

export default defineNuxtPlugin(nuxtAppMain => {
  
  const getTenant = () => {
    if (window) {
      const tenant = window.location.hostname.split('.')[0];
      // Salvar o tenant_id no localStorage para uso posterior
      if (tenant && tenant !== 'localhost' && tenant !== 'www') {
        localStorage.setItem('tenant_id', tenant);
      }
      return tenant;
    }
    return '';
  }
  const getApiUrl = () => (window ? window.origin.replace(getTenant(), 'graphql').replace(':3000', '') : '')

  const httpLink = new HttpLink({ uri: `${getApiUrl()}/graphql`, })

  const token = localStorage.getItem('userToken'); // Recuperar o token do localStorage

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        'x-tenant': getTenant(),
        'Authorization': token ? `Bearer ${token}` : "", // Incluir o token no cabeçalho de autorização
      },
    }
  })

  // NOTE - Adicionar link de tratamento de erro
  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.log(err.message)
        if (err.message === 'Unauthenticated.') {
          localStorage.removeItem("user");
          localStorage.removeItem("userToken");
          localStorage.removeItem('apollo:default.token') // Limpar o token
          window.location.href = '/login'
        }
      }
    }
  })

  const apolloClient = new ApolloClient({
    link: errorLink.concat(authLink).concat(httpLink),
    cache: new InMemoryCache(),
  })

  const nuxtApp = useNuxtApp()
  
  nuxtApp._apolloClients.default = apolloClient
})