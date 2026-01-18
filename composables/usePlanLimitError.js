import { ref } from 'vue'

const isModalOpen = ref(false)
const errorData = ref({})

export const usePlanLimitError = () => {
  const showModal = (data) => {
    errorData.value = data
    isModalOpen.value = true
  }

  const hideModal = () => {
    isModalOpen.value = false
    errorData.value = {}
  }

  const parsePlanLimitError = (error) => {
    // Verifica se é um erro GraphQL
    if (!error?.graphQLErrors || error.graphQLErrors.length === 0) {
      return null
    }

    const graphQLError = error.graphQLErrors[0]
    let message = graphQLError.message || ''

    // Verificar se a mensagem está dentro de extensions.validation
    if (graphQLError.extensions?.validation) {
      const validationErrors = graphQLError.extensions.validation
      
      // Procurar por mensagens de limite ou trial expirado em todas as chaves de validação
      for (const field in validationErrors) {
        const fieldErrors = validationErrors[field]
        
        if (Array.isArray(fieldErrors)) {
          for (const errorMsg of fieldErrors) {
            if (typeof errorMsg === 'string') {
              // Verificar se é erro de trial expirado
              if (errorMsg.includes('trial expirou') || errorMsg.includes('assinar um plano')) {
                message = errorMsg
                break
              }
              // Verificar se é erro de limite
              if (errorMsg.includes('Você atingiu o limite de')) {
                message = errorMsg
                break
              }
            }
          }
        }
        
        if (message.includes('trial expirou') || message.includes('assinar um plano') || message.includes('Você atingiu o limite de')) {
          break
        }
      }
    }

    // Verificar se é erro de trial expirado
    if (message.includes('trial expirou') || message.includes('assinar um plano')) {
      return {
        type: 'trial_expired',
        message: message,
        planName: 'Nenhum plano ativo',
        fullMessage: message
      }
    }

    // Se não encontrou mensagem de limite, retornar null
    if (!message.includes('Você atingiu o limite de')) {
      return null
    }

    // Detectar erro de limite de usuários
    if (message.includes('usuário')) {
      // Extrair números da mensagem usando regex
      const currentMatch = message.match(/Atualmente você tem (\d+) usuário/)
      const maxMatch = message.match(/limite de (\d+) usuário/)

      return {
        type: 'users',
        message: message.split('Para adicionar mais itens')[0].trim(),
        current: currentMatch ? parseInt(currentMatch[1]) : undefined,
        max: maxMatch ? parseInt(maxMatch[1]) : undefined,
        planName: 'Plano Atual',
        fullMessage: message
      }
    }

    // Detectar erro de limite de times
    if (message.includes('time')) {
      // Extrair números da mensagem usando regex
      const currentMatch = message.match(/Atualmente você tem (\d+) time/)
      const maxMatch = message.match(/limite de (\d+) time/)

      return {
        type: 'teams',
        message: message.split('Para adicionar mais itens')[0].trim(),
        current: currentMatch ? parseInt(currentMatch[1]) : undefined,
        max: maxMatch ? parseInt(maxMatch[1]) : undefined,
        planName: 'Plano Atual',
        fullMessage: message
      }
    }

    return null
  }

  const handleGraphQLError = (error) => {
    const planLimitError = parsePlanLimitError(error)
    
    if (planLimitError) {
      showModal(planLimitError)
      return true // Indica que o erro foi tratado
    }
    
    return false // Indica que o erro não é de limite de plano
  }

  return {
    isModalOpen,
    errorData,
    showModal,
    hideModal,
    parsePlanLimitError,
    handleGraphQLError
  }
}

