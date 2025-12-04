/**
 * Utilitários para integração com Stripe
 */

/**
 * Formata valor em centavos para moeda brasileira
 * @param {number} amount - Valor em centavos
 * @param {string} currency - Código da moeda (padrão: BRL)
 * @returns {string} Valor formatado
 */
export const formatCurrency = (amount, currency = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(amount / 100)
}

/**
 * Converte valor de reais para centavos
 * @param {number} amount - Valor em reais
 * @returns {number} Valor em centavos
 */
export const convertToCents = (amount) => {
  return Math.round(amount * 100)
}

/**
 * Converte valor de centavos para reais
 * @param {number} amount - Valor em centavos
 * @returns {number} Valor em reais
 */
export const convertFromCents = (amount) => {
  return amount / 100
}

/**
 * Valida se uma chave do Stripe é válida
 * @param {string} key - Chave do Stripe
 * @returns {boolean} True se a chave for válida
 */
export const isValidStripeKey = (key) => {
  if (!key) return false
  
  // Chaves de teste começam com pk_test_ ou sk_test_
  // Chaves de produção começam com pk_live_ ou sk_live_
  const keyPattern = /^(pk|sk)_(test|live)_[a-zA-Z0-9]{24}$/
  return keyPattern.test(key)
}

/**
 * Obtém o ambiente do Stripe baseado na chave
 * @param {string} key - Chave do Stripe
 * @returns {string} 'test' ou 'live'
 */
export const getStripeEnvironment = (key) => {
  if (!key) return null
  
  if (key.includes('_test_')) return 'test'
  if (key.includes('_live_')) return 'live'
  
  return null
}

/**
 * Cria um objeto de estilo para os elementos do Stripe
 * @param {Object} customStyles - Estilos customizados
 * @returns {Object} Objeto de estilo do Stripe
 */
export const createStripeStyles = (customStyles = {}) => {
  const defaultStyles = {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      iconColor: '#6772e5',
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146',
    },
    complete: {
      color: '#0d9488',
      iconColor: '#0d9488',
    }
  }

  return {
    ...defaultStyles,
    ...customStyles
  }
}

/**
 * Trata erros do Stripe e retorna mensagens amigáveis
 * @param {Object} error - Erro do Stripe
 * @returns {string} Mensagem de erro amigável
 */
export const getStripeErrorMessage = (error) => {
  if (!error) return 'Erro desconhecido'

  // Erros comuns do Stripe
  const errorMessages = {
    'card_declined': 'Cartão recusado. Verifique os dados ou entre em contato com seu banco.',
    'expired_card': 'Cartão expirado. Use outro cartão.',
    'incorrect_cvc': 'Código de segurança incorreto.',
    'insufficient_funds': 'Saldo insuficiente no cartão.',
    'invalid_expiry_month': 'Mês de expiração inválido.',
    'invalid_expiry_year': 'Ano de expiração inválido.',
    'invalid_number': 'Número do cartão inválido.',
    'processing_error': 'Erro ao processar o pagamento. Tente novamente.',
    'rate_limit': 'Muitas tentativas. Aguarde um momento e tente novamente.'
  }

  return errorMessages[error.code] || error.message || 'Erro ao processar pagamento.'
}

/**
 * Cria um objeto de opções para o Payment Element
 * @param {Object} options - Opções customizadas
 * @returns {Object} Objeto de opções do Payment Element
 */
export const createPaymentElementOptions = (options = {}) => {
  const defaultOptions = {
    layout: 'tabs',
    paymentMethodOrder: ['card', 'pix', 'boleto'],
    fields: {
      billingDetails: {
        name: 'auto',
        email: 'auto',
        phone: 'auto',
        address: 'auto'
      }
    },
    business: {
      name: 'VoleiClub'
    }
  }

  return {
    ...defaultOptions,
    ...options
  }
}
