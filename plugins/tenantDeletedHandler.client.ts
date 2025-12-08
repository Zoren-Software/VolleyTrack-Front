import { defineNuxtPlugin } from '#app'

/**
 * Verifica se uma mensagem de erro indica que o tenant foi deletado
 */
function isTenantDeletedError(message: string): boolean {
  if (!message || typeof message !== 'string') return false
  
  const lowerMessage = message.toLowerCase()
  
  return (
    (lowerMessage.includes('database') && lowerMessage.includes('does not exist')) ||
    lowerMessage.includes('erro ao inicializar tenant') ||
    (lowerMessage.includes('tenant') && (lowerMessage.includes('deletado') || lowerMessage.includes('deleted'))) ||
    lowerMessage.includes('tenant database does not exist')
  )
}

/**
 * Redireciona para a página de tenant deletado
 */
function redirectToTenantDeletedPage(errorMessage: string) {
  if (window.location.pathname === '/tenant-deleted') {
    return // Já está na página
  }
  
  // Salvar informações do erro no localStorage para a página usar
  localStorage.setItem('tenantDeletedError', JSON.stringify({
    message: errorMessage,
    timestamp: new Date().toISOString()
  }))
  
  // Redirecionar
  window.location.href = '/tenant-deleted'
}

export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return

  // Interceptar fetch globalmente para capturar erros de API REST
  const originalFetch = window.fetch

  window.fetch = async function (...args) {
    try {
      const response = await originalFetch(...args)
      
      // Verificar se a resposta contém erro de tenant deletado
      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          // Clonar a resposta para ler sem consumir o stream
          const clonedResponse = response.clone()
          try {
            const data = await clonedResponse.json()
            
            // Verificar se é erro de tenant deletado
            if (data.message && isTenantDeletedError(data.message)) {
              console.error('🚨 Tenant deletado detectado na API REST:', data.message)
              redirectToTenantDeletedPage(data.message)
              
              // Retornar uma resposta vazia para evitar que o erro seja processado
              return new Response(JSON.stringify({ success: false, tenantDeleted: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              })
            }
          } catch (e) {
            // Se não conseguir parsear JSON, ignorar
            console.warn('Não foi possível parsear resposta como JSON:', e)
          }
        }
      }
      
      return response
    } catch (error) {
      // Se houver erro na requisição, verificar se é relacionado a tenant
      if (error instanceof Error && isTenantDeletedError(error.message)) {
        console.error('🚨 Erro de tenant deletado na requisição:', error.message)
        redirectToTenantDeletedPage(error.message)
      }
      
      throw error
    }
  }

  // Interceptar erros do Apollo GraphQL (caso apareçam)
  nuxtApp.hook('apollo:error', (error) => {
    if (error && error.message && isTenantDeletedError(error.message)) {
      console.error('🚨 Tenant deletado detectado no GraphQL:', error.message)
      redirectToTenantDeletedPage(error.message)
    }
  })

  // Interceptar erros Vue globais
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    if (error instanceof Error && isTenantDeletedError(error.message)) {
      console.error('🚨 Tenant deletado detectado no Vue:', error.message)
      redirectToTenantDeletedPage(error.message)
      return // Prevenir que o erro seja logado normalmente
    }
  }

  // Interceptar promessas rejeitadas não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    if (error instanceof Error && isTenantDeletedError(error.message)) {
      console.error('🚨 Tenant deletado detectado em promise rejeitada:', error.message)
      redirectToTenantDeletedPage(error.message)
      event.preventDefault() // Prevenir que apareça no console
    }
  })
})
