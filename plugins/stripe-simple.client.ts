import { loadStripe } from '@stripe/stripe-js'

export default defineNuxtPlugin(async () => {
  try {
    const runtimeConfig = useRuntimeConfig()
    const publishableKey = runtimeConfig.public.stripePublishableKey

    const stripe = await loadStripe(publishableKey)
    
    return {
      provide: {
        stripe: stripe || null
      }
    }
  } catch (error) {
    console.error('Erro ao carregar Stripe:', error)
    return {
      provide: {
        stripe: null
      }
    }
  }
})
