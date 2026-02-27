/**
 * Service para gerenciar informações do Plano Vitalício
 */

import { getApiBaseUrl } from '~/utils/apiBaseUrl'

/**
 * Buscar contador de planos vitalícios vendidos
 * 
 * @returns {Promise<Object>} Dados do contador
 * @example
 * {
 *   success: true,
 *   data: {
 *     total_sold: 15,
 *     limit: 500,
 *     remaining: 485,
 *     percentage: 3,
 *     is_sold_out: false
 *   }
 * }
 */
export const getLifetimePlansCount = async () => {
  try {
    console.log('📊 Buscando contador de planos vitalícios')

    const url = `${getApiBaseUrl()}/v1/customers/lifetime-plans-count`
    console.log('🔍 URL da requisição:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    console.log('🔍 Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Erro ao buscar contador:', errorData)
      
      throw new Error(`Erro HTTP ${response.status}: ${errorData.message || 'Erro desconhecido'}`)
    }

    const data = await response.json()
    console.log('✅ Contador obtido com sucesso:', data)
    
    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('❌ Erro ao buscar contador de planos vitalícios:', error)
    
    return {
      success: false,
      error: error.message,
      data: {
        total_sold: 0,
        limit: 500,
        remaining: 500,
        percentage: 0,
        is_sold_out: false
      }
    }
  }
}

/**
 * Verificar se plano vitalício está disponível para compra
 * 
 * @returns {Promise<Object>} Status de disponibilidade
 * @example
 * {
 *   success: true,
 *   available: true,
 *   message: 'Plano disponível para compra'
 * }
 */
export const checkLifetimePlanAvailability = async () => {
  try {
    const result = await getLifetimePlansCount()
    
    if (!result.success) {
      return {
        success: false,
        available: false,
        message: 'Erro ao verificar disponibilidade',
        data: null
      }
    }

    const { is_sold_out, remaining } = result.data

    if (is_sold_out) {
      return {
        success: true,
        available: false,
        message: 'Plano vitalício esgotado! Limite de 500 contas atingido.',
        data: result.data
      }
    }

    return {
      success: true,
      available: true,
      message: `Plano disponível! ${remaining} vagas restantes.`,
      data: result.data
    }

  } catch (error) {
    console.error('❌ Erro ao verificar disponibilidade:', error)
    
    return {
      success: false,
      available: false,
      message: 'Erro ao verificar disponibilidade',
      data: null
    }
  }
}

/**
 * Formatar mensagem de disponibilidade para exibir no UI
 * 
 * @param {Number} totalSold - Total vendido
 * @param {Number} limit - Limite máximo
 * @returns {String} Mensagem formatada
 */
export const formatAvailabilityMessage = (totalSold, limit) => {
  const remaining = limit - totalSold
  
  if (remaining <= 0) {
    return '🔴 ESGOTADO'
  }
  
  if (remaining <= 10) {
    return `🔥 Últimas ${remaining} vagas!`
  }
  
  if (remaining <= 50) {
    return `⚡ Restam apenas ${remaining} vagas`
  }
  
  return `✨ ${remaining}/${limit} disponíveis`
}

/**
 * Obter cor do badge baseado na disponibilidade
 * 
 * @param {Number} totalSold - Total vendido
 * @param {Number} limit - Limite máximo
 * @returns {String} Cor para o badge
 */
export const getBadgeColor = (totalSold, limit) => {
  const remaining = limit - totalSold
  const percentage = (totalSold / limit) * 100
  
  if (remaining <= 0) {
    return 'danger' // Vermelho - Esgotado
  }
  
  if (percentage >= 90) {
    return 'warning' // Laranja - Quase esgotado
  }
  
  if (percentage >= 70) {
    return 'info' // Azul - Vendendo bem
  }
  
  return 'success' // Verde - Disponível
}

