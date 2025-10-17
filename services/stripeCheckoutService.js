/**
 * Service para gerenciar integração com Stripe Checkout
 * Utiliza o novo endpoint do backend Laravel com email pré-preenchido
 */

const API_BASE_URL = 'http://api.volleytrack.local/api'

/**
 * Criar sessão de checkout no Stripe
 * @param {Object} checkoutData - Dados para criar a sessão
 * @param {string} checkoutData.price_id - ID do preço do Stripe
 * @param {string} checkoutData.customer_email - Email do cliente
 * @param {string} checkoutData.success_url - URL de sucesso
 * @param {string} checkoutData.cancel_url - URL de cancelamento
 * @param {string} checkoutData.mode - Modo do checkout (payment ou subscription)
 * @param {number} [checkoutData.quantity=1] - Quantidade do item
 * @returns {Promise<Object>} Resposta da API
 */
export const createCheckoutSession = async (checkoutData) => {
  try {
    console.log('🔍 Criando sessão de checkout:', checkoutData)
    console.log('🔍 Email sendo enviado para o backend:', checkoutData.customer_email)

    // Obter token de autenticação
    const token = localStorage.getItem('userToken');
    const apolloToken = localStorage.getItem('apollo:default.token');
    
    console.log('🔍 Debug de tokens:');
    console.log('🔍 userToken:', token);
    console.log('🔍 apollo:default.token:', apolloToken);
    
    if (!token && !apolloToken) {
      throw new Error("Token de autenticação não encontrado. Faça login novamente.");
    }

    // Usar o token disponível (priorizar userToken, depois apollo)
    const authToken = token || apolloToken;
    console.log('🔍 Token que será usado:', authToken);

    const response = await fetch(`${API_BASE_URL}/checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`, // ✅ Adicionar token de autenticação
      },
      body: JSON.stringify(checkoutData)
    })

    console.log('🔍 Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Erro na resposta:', errorData)
      
      if (response.status === 422) {
        throw new Error(`Erro de validação: ${errorData.message || 'Dados inválidos'}`)
      } else if (response.status === 500) {
        throw new Error(`Erro do servidor: ${errorData.message || 'Erro interno'}`)
      } else {
        throw new Error(`Erro HTTP ${response.status}: ${errorData.message || 'Erro desconhecido'}`)
      }
    }

    const data = await response.json()
    console.log('✅ Sessão criada com sucesso:', data)
    
    // Extrair session ID da resposta (pode estar em data.session_id ou data.data.id)
    const sessionId = data.session_id || data.data?.id || data.id
    
    console.log('🔍 Session ID extraído:', sessionId)
    console.log('🔍 Estrutura da resposta:', {
      'data.session_id': data.session_id,
      'data.data?.id': data.data?.id,
      'data.id': data.id,
      'sessionId final': sessionId
    })
    
    if (!sessionId) {
      throw new Error('Session ID não encontrado na resposta da API')
    }
    
    return {
      success: true,
      data: data.data || data,
      sessionId: sessionId
    }
  } catch (error) {
    console.error('❌ Erro ao criar sessão de checkout:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Consultar sessão de checkout
 * @param {string} sessionId - ID da sessão do Stripe
 * @returns {Promise<Object>} Dados da sessão
 */
export const getCheckoutSession = async (sessionId) => {
  try {
    console.log('🔍 Consultando sessão:', sessionId)

    // Obter token de autenticação
    const token = localStorage.getItem('userToken');
    const apolloToken = localStorage.getItem('apollo:default.token');
    
    console.log('🔍 Debug de tokens:');
    console.log('🔍 userToken:', token);
    console.log('🔍 apollo:default.token:', apolloToken);
    
    if (!token && !apolloToken) {
      throw new Error("Token de autenticação não encontrado. Faça login novamente.");
    }

    // Usar o token disponível (priorizar userToken, depois apollo)
    const authToken = token || apolloToken;
    console.log('🔍 Token que será usado:', authToken);

    const response = await fetch(`${API_BASE_URL}/checkout-session/${sessionId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`, // ✅ Adicionar token de autenticação
      }
    })

    console.log('🔍 Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Erro na consulta:', errorData)
      
      if (response.status === 404) {
        throw new Error('Sessão não encontrada')
      } else if (response.status === 500) {
        throw new Error(`Erro do servidor: ${errorData.message || 'Erro interno'}`)
      } else {
        throw new Error(`Erro HTTP ${response.status}: ${errorData.message || 'Erro desconhecido'}`)
      }
    }

    const data = await response.json()
    console.log('✅ Sessão consultada com sucesso:', data)
    
    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('❌ Erro ao consultar sessão:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Redirecionar para checkout do Stripe
 * @param {Object} stripe - Instância do Stripe
 * @param {string} sessionId - ID da sessão
 * @returns {Promise<Object>} Resultado do redirecionamento
 */
export const redirectToCheckout = async (stripe, sessionId) => {
  try {
    console.log('🔍 Redirecionando para checkout:', sessionId)

    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionId
    })

    if (error) {
      console.error('❌ Erro no redirecionamento:', error)
      throw error
    }

    console.log('✅ Redirecionamento iniciado com sucesso')
    return {
      success: true
    }
  } catch (error) {
    console.error('❌ Erro ao redirecionar para checkout:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Validar dados de checkout antes de criar sessão
 * @param {Object} checkoutData - Dados para validar
 * @returns {Object} Resultado da validação
 */
export const validateCheckoutData = (checkoutData) => {
  const errors = []

  if (!checkoutData.price_id) {
    errors.push('ID do preço é obrigatório')
  }

  if (!checkoutData.customer_email) {
    errors.push('Email do cliente é obrigatório')
  } else if (!isValidEmail(checkoutData.customer_email)) {
    errors.push('Email do cliente é inválido')
  }

  if (!checkoutData.success_url) {
    errors.push('URL de sucesso é obrigatória')
  }

  if (!checkoutData.cancel_url) {
    errors.push('URL de cancelamento é obrigatória')
  }

  if (!checkoutData.mode) {
    errors.push('Modo do checkout é obrigatório')
  } else if (!['payment', 'subscription'].includes(checkoutData.mode)) {
    errors.push('Modo do checkout deve ser "payment" ou "subscription"')
  }

  // Validar quantidade (opcional, padrão 1)
  if (checkoutData.quantity !== undefined && checkoutData.quantity <= 0) {
    errors.push('Quantidade deve ser maior que zero')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validar email
 * @param {string} email - Email para validar
 * @returns {boolean} Email válido
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Extrair session ID da URL
 * @param {string} url - URL para extrair session ID
 * @returns {string|null} Session ID ou null
 */
export const extractSessionIdFromUrl = (url) => {
  try {
    const urlObj = new URL(url)
    const sessionId = urlObj.searchParams.get('session_id')
    return sessionId
  } catch (error) {
    console.error('❌ Erro ao extrair session ID da URL:', error)
    return null
  }
}

/**
 * Extrair session ID da URL atual
 * @returns {string|null} Session ID ou null
 */
export const getCurrentSessionId = () => {
  if (process.client) {
    return extractSessionIdFromUrl(window.location.href)
  }
  return null
}
