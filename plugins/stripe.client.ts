import { loadStripe } from '@stripe/stripe-js'

// Variável global para evitar múltiplas instâncias
let stripePromise: Promise<any> | null = null

export default defineNuxtPlugin(async (nuxtApp) => {
  // Verificar se $stripe já existe
  if (nuxtApp.$stripe !== undefined) {
    console.log('✅ Stripe já está disponível')
    // Retornar sem definir nada
    return {}
  }

  // Se já temos uma promise em andamento, aguardar ela
  if (stripePromise) {
    const stripe = await stripePromise
    return {
      provide: {
        stripe: stripe
      }
    }
  }

  try {
    // Usar useRuntimeConfig para acessar variáveis de ambiente
    const runtimeConfig = useRuntimeConfig()
    const publishableKey = runtimeConfig.public.stripePublishableKey
    
    // Criar promise única
    stripePromise = loadStripe(publishableKey)
    
    // Aguardar carregamento
    const stripe = await stripePromise
    
    if (stripe) {
      console.log('✅ Stripe carregado com sucesso')
    }

    return {
      provide: {
        stripe: stripe || null
      }
    }
  } catch (error) {
    console.error('❌ Erro ao carregar Stripe:', error)
    
    // Resetar promise em caso de erro
    stripePromise = null
    
    return {
      provide: {
        stripe: null
      }
    }
  }
})
