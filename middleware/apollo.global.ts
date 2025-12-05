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
        
        // Verificar se é erro de tenant deletado
        if (
          err.message &&
          (
            (err.message.includes('Database') && err.message.includes('does not exist')) ||
            err.message.includes('Erro ao inicializar tenant') ||
            (err.message.includes('tenant') && (err.message.includes('deletado') || err.message.includes('deleted')))
          )
        ) {
          console.error('🚨 Tenant deletado detectado no GraphQL:', err.message)
          if (window.location.pathname !== '/tenant-deleted') {
            localStorage.setItem('tenantDeletedError', JSON.stringify({
              message: err.message,
              timestamp: new Date().toISOString()
            }))
            window.location.href = '/tenant-deleted'
          }
        }
      }
    }
    
    // Verificar erros de rede também
    if (networkError) {
      const errorMessage = networkError.message || String(networkError)
      if (
        (errorMessage.includes('Database') && errorMessage.includes('does not exist')) ||
        errorMessage.includes('Erro ao inicializar tenant') ||
        (errorMessage.includes('tenant') && (errorMessage.includes('deletado') || errorMessage.includes('deleted')))
      ) {
        console.error('🚨 Tenant deletado detectado no erro de rede GraphQL:', errorMessage)
        if (window.location.pathname !== '/tenant-deleted') {
          localStorage.setItem('tenantDeletedError', JSON.stringify({
            message: errorMessage,
            timestamp: new Date().toISOString()
          }))
          window.location.href = '/tenant-deleted'
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