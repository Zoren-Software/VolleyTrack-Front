import { usePlanLimitError } from '~/composables/usePlanLimitError'
import { confirmError } from '~/utils/sweetAlert2/swalHelper'

/**
 * Wrapper para mutações GraphQL que detecta automaticamente erros de limite de plano
 * e exibe o modal customizado. Para outros erros, usa o comportamento padrão.
 * 
 * @param {Function} mutationFn - Função async que executa a mutation
 * @param {Object} options - Opções de configuração
 * @param {Function} options.onSuccess - Callback de sucesso
 * @param {Function} options.onError - Callback de erro (chamado após tratamento do modal)
 * @param {String} options.errorTitle - Título personalizado para erros não relacionados a limite
 * @returns {Promise} - Resultado da mutation
 * 
 * @example
 * import { handleMutation } from '~/utils/graphql/mutationHandler'
 * 
 * const createUser = async () => {
 *   await handleMutation(
 *     async () => {
 *       const { mutate } = useMutation(USER_CREATE_MUTATION, { variables })
 *       return await mutate()
 *     },
 *     {
 *       onSuccess: (data) => {
 *         console.log('Usuário criado!', data)
 *       },
 *       onError: (error) => {
 *         console.error('Erro ao criar usuário', error)
 *       }
 *     }
 *   )
 * }
 */
export async function handleMutation(mutationFn, options = {}) {
  const { handleGraphQLError } = usePlanLimitError()
  const {
    onSuccess,
    onError,
    errorTitle = 'Erro ao executar operação',
  } = options

  try {
    const result = await mutationFn()
    
    if (onSuccess) {
      onSuccess(result)
    }
    
    return result
  } catch (error) {
    console.error('Mutation error:', error)

    // Tentar tratar como erro de limite de plano
    const wasHandled = handleGraphQLError(error)

    if (!wasHandled) {
      // Se não foi erro de limite de plano, usar tratamento padrão
      handleStandardGraphQLError(error, errorTitle)
    }

    // Chamar callback de erro se fornecido
    if (onError) {
      onError(error)
    }

    throw error
  }
}

/**
 * Tratamento padrão para erros GraphQL (não relacionados a limite de plano)
 */
function handleStandardGraphQLError(error, title) {
  if (
    error.graphQLErrors &&
    error.graphQLErrors[0]?.extensions?.validation
  ) {
    const errors = error.graphQLErrors[0].extensions.validation

    const errorMessages = Object.values(errors).map((item) => {
      if (Array.isArray(item)) {
        return item[0]
      }
      return item
    })

    const footer = errorMessages.join('<br>')
    confirmError(title, footer)
  } else if (error.graphQLErrors && error.graphQLErrors[0]?.message) {
    confirmError(title, error.graphQLErrors[0].message)
  } else {
    confirmError(title, 'Ocorreu um erro desconhecido.')
  }
}

/**
 * Hook simples para usar em componentes Vue
 * 
 * @example
 * import { useMutationHandler } from '~/utils/graphql/mutationHandler'
 * 
 * export default {
 *   setup() {
 *     const { executeMutation } = useMutationHandler()
 *     
 *     const createUser = async () => {
 *       await executeMutation(
 *         async () => {
 *           const { mutate } = useMutation(USER_CREATE_MUTATION)
 *           return await mutate()
 *         },
 *         {
 *           onSuccess: () => console.log('Sucesso!')
 *         }
 *       )
 *     }
 *     
 *     return { createUser }
 *   }
 * }
 */
export function useMutationHandler() {
  return {
    executeMutation: handleMutation
  }
}

