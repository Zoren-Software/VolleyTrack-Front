import { defineNuxtPlugin } from '#app'
import { usePlanLimitError } from '~/composables/usePlanLimitError'

export default defineNuxtPlugin((nuxtApp) => {
  const { handleGraphQLError } = usePlanLimitError()

  // Hook global para capturar erros Vue
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    // Tentar tratar como erro de limite de plano
    if (!handleGraphQLError(error)) {
      // Se não for erro de limite de plano, logar normalmente
      console.error('Vue Error:', error, info)
    }
  }

  // Hook para capturar erros não tratados
  if (process.client) {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason
      
      // Tentar tratar como erro de limite de plano
      if (error && !handleGraphQLError(error)) {
        // Se não for erro de limite de plano, deixar o comportamento padrão
        console.error('Unhandled Promise Rejection:', error)
      } else {
        // Prevenir o erro de aparecer no console se foi tratado
        event.preventDefault()
      }
    })
  }

  // Disponibilizar globalmente
  return {
    provide: {
      handlePlanLimitError: handleGraphQLError
    }
  }
})

