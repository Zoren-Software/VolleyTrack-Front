/**
 * Service para gerenciar troca de planos com pro-rata
 * Integração com endpoints do backend Laravel
 */

class PlanSwapService {
  /**
   * Obter URL base da API
   * @returns {string} URL base da API
   */
  getApiBaseUrl() {
    if (process.client) {
      // Tentar obter do window.__NUXT__ (runtime config do Nuxt)
      if (typeof window !== 'undefined' && window.__NUXT__?.config?.public?.apiEndpoint) {
        return window.__NUXT__.config.public.apiEndpoint
      }
      // Tentar obter do process.env (se disponível)
      if (process.env.API_ENDPOINT) {
        return process.env.API_ENDPOINT
      }
    }
    // Valor padrão como fallback
    return 'http://api.volleytrack.local'
  }
  /**
   * Preview da troca de planos
   * @param {number} customerId - ID do customer no banco central
   * @param {string} newPriceId - ID do novo preço no Stripe
   * @returns {Promise<Object>} Dados do preview da troca
   */
  async previewPlanSwap(customerId, newPriceId) {
    try {
      console.log('🔍 Calculando preview da troca de planos:', { customerId, newPriceId })

      const token = this.getToken()
      if (!token) {
        throw new Error("Token de autenticação não encontrado. Faça login novamente.")
      }

      const apiBaseUrl = this.getApiBaseUrl()
      console.log('🔍 Token sendo usado na requisição:', token)
      console.log('🔍 URL da requisição:', `${apiBaseUrl}/v1/subscriptions/preview-swap`)

      const response = await fetch(`${apiBaseUrl}/v1/subscriptions/preview-swap`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          customer_id: customerId,
          new_price_id: newPriceId
        })
      })

      console.log('🔍 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro no preview da troca:', errorData)
        
        if (response.status === 401) {
          throw new Error('Token de autenticação inválido')
        } else if (response.status === 404) {
          throw new Error('Assinatura ativa não encontrada para este customer')
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Erro na validação dos dados')
        } else if (response.status === 500) {
          throw new Error(`Erro do servidor: ${errorData.message || 'Erro interno'}`)
        } else {
          throw new Error(`Erro HTTP ${response.status}: ${errorData.message || 'Erro desconhecido'}`)
        }
      }

      const data = await response.json()
      console.log('✅ Preview da troca calculado com sucesso:', data)
      
      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      console.error('❌ Erro ao calcular preview da troca:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Executar troca de planos
   * @param {number} customerId - ID do customer no banco central
   * @param {string} newPriceId - ID do novo preço no Stripe
   * @param {string} prorationBehavior - Comportamento do pro-rata
   * @param {string} successUrl - URL de sucesso (opcional)
   * @param {string} cancelUrl - URL de cancelamento (opcional)
   * @returns {Promise<Object>} Resultado da troca
   */
  async swapPlan(customerId, newPriceId, prorationBehavior = 'create_prorations', successUrl = null, cancelUrl = null) {
    try {
      console.log('🔄 Executando troca de planos:', { customerId, newPriceId, prorationBehavior, successUrl, cancelUrl })

      const token = this.getToken()
      if (!token) {
        throw new Error("Token de autenticação não encontrado. Faça login novamente.")
      }

      // Se as URLs não foram fornecidas, usar as URLs padrão do frontend
      if (!successUrl && process.client) {
        successUrl = `${window.location.origin}/payment/success`
      }
      if (!cancelUrl && process.client) {
        cancelUrl = `${window.location.origin}/payment/cancel`
      }

      const apiBaseUrl = this.getApiBaseUrl()
      const requestBody = {
        customer_id: customerId,
        new_price_id: newPriceId,
        proration_behavior: prorationBehavior
      }

      // Adicionar URLs se fornecidas
      if (successUrl) {
        requestBody.success_url = successUrl
      }
      if (cancelUrl) {
        requestBody.cancel_url = cancelUrl
      }

      const response = await fetch(`${apiBaseUrl}/v1/subscriptions/swap-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🔍 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na troca de planos:', errorData)
        
        if (response.status === 401) {
          throw new Error('Token de autenticação inválido')
        } else if (response.status === 404) {
          throw new Error('Assinatura ativa não encontrada para este customer')
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Erro na validação dos dados')
        } else if (response.status === 500) {
          throw new Error(`Erro do servidor: ${errorData.message || 'Erro interno'}`)
        } else {
          throw new Error(`Erro HTTP ${response.status}: ${errorData.message || 'Erro desconhecido'}`)
        }
      }

      const data = await response.json()
      console.log('✅ Troca de planos executada com sucesso:', data)
      
      return {
        success: true,
        requires_checkout: data.requires_checkout || false,
        checkout_session_id: data.checkout_session_id || null,
        checkout_url: data.checkout_url || null,
        data: data.data || data
      }
    } catch (error) {
      console.error('❌ Erro ao trocar plano:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Formatar valor em centavos para reais
   * @param {number} amountInCents - Valor em centavos
   * @returns {string} Valor formatado em reais
   */
  formatCurrency(amountInCents) {
    return (amountInCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  /**
   * Formatar data para exibição
   * @param {string} dateString - Data em formato ISO
   * @returns {string} Data formatada
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  /**
   * Obter token de autenticação
   * @returns {string} Token de autenticação
   */
  getToken() {
    if (process.client) {
      const userToken = localStorage.getItem('userToken')
      const apolloToken = localStorage.getItem('apollo:default.token')
      
      console.log('🔍 Debug de tokens no planSwapService:')
      console.log('🔍 userToken:', userToken)
      console.log('🔍 apollo:default.token:', apolloToken)
      
      const token = userToken || apolloToken
      console.log('🔍 Token selecionado:', token)
      
      return token || ''
    }
    return ''
  }

  /**
   * Validar se é possível trocar para o novo plano
   * @param {string} currentPriceId - ID do plano atual
   * @param {string} newPriceId - ID do novo plano
   * @returns {boolean} Se é possível trocar
   */
  canSwapPlan(currentPriceId, newPriceId) {
    return currentPriceId !== newPriceId
  }

  /**
   * Obter tipo de troca (upgrade/downgrade)
   * @param {number} currentAmount - Valor do plano atual em centavos
   * @param {number} newAmount - Valor do novo plano em centavos
   * @returns {string} Tipo da troca
   */
  getSwapType(currentAmount, newAmount) {
    if (newAmount > currentAmount) {
      return 'upgrade'
    } else if (newAmount < currentAmount) {
      return 'downgrade'
    } else {
      return 'same'
    }
  }

  /**
   * Verificar se erro 400 é de subscription existente
   * @param {Object} errorData - Dados do erro
   * @returns {boolean} Se é erro de subscription existente
   */
  isExistingSubscriptionError(errorData) {
    const message = errorData?.message || ''
    return message.toLowerCase().includes('already has an active subscription') ||
           message.toLowerCase().includes('subscription already exists') ||
           message.toLowerCase().includes('já possui uma assinatura ativa')
  }
}

export default new PlanSwapService()