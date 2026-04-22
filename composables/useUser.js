import { ref } from 'vue'

export const useUser = () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Obter informações do usuário logado
  const getUserInfo = async () => {
    try {
      loading.value = true
      error.value = null

      // Primeiro tentar pegar do localStorage
      if (localStorage.getItem("user")) {
        user.value = JSON.parse(localStorage.getItem("user"))
        console.log("✅ Usuário carregado do localStorage:", user.value)
        return user.value
      }

      // Se não estiver no localStorage, fazer query GraphQL
      console.log("🔍 Buscando usuário via GraphQL...")
      
      // Query ME para obter dados do usuário
      const ME_QUERY = `
        query me {
          me {
            id
            name
            email
            roles {
              id
              name
              createdAt
              updatedAt
            }
            permissions {
              id
              name
            }
            emailVerifiedAt
          }
        }
      `

      // Fazer a query usando useAsyncQuery
      const { data: { value } } = await useAsyncQuery(ME_QUERY, {})

      if (value?.me) {
        user.value = value.me
        localStorage.setItem("user", JSON.stringify(user.value))
        console.log("✅ Usuário carregado via GraphQL:", user.value)
        return user.value
      } else {
        console.warn("⚠️ Nenhum usuário encontrado")
        user.value = null
        return null
      }
    } catch (err) {
      console.error("❌ Erro ao carregar usuário:", err)
      error.value = err.message
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  // Limpar dados do usuário (logout)
  const clearUser = () => {
    user.value = null
    localStorage.removeItem("user")
    localStorage.removeItem("userToken")
    console.log("✅ Dados do usuário limpos")
  }

  // Verificar se o usuário está logado
  const isLoggedIn = computed(() => {
    return !!user.value && !!user.value.id
  })

  // Verificar se o usuário tem uma permissão específica
  const hasPermission = (permissionName) => {
    if (!user.value?.permissions) return false
    return user.value.permissions.some(p => p.name === permissionName)
  }

  // Verificar se o usuário tem um role específico
  const hasRole = (roleName) => {
    if (!user.value?.roles) return false
    return user.value.roles.some(role => role.name === roleName)
  }

  // Verificar se o usuário tem qualquer um dos roles especificados
  const hasAnyRole = (roleNames) => {
    if (!user.value?.roles) return false
    return user.value.roles.some(role => roleNames.includes(role.name))
  }

  // Verificar se o usuário tem todos os roles especificados
  const hasAllRoles = (roleNames) => {
    if (!user.value?.roles) return false
    return roleNames.every(roleName => 
      user.value.roles.some(role => role.name === roleName)
    )
  }

  // Obter email do usuário para uso no Stripe
  const getUserEmail = () => {
    return user.value?.email || null
  }

  // Obter ID do usuário
  const getUserId = () => {
    return user.value?.id || null
  }

  // Obter nome do usuário
  const getUserName = () => {
    return user.value?.name || 'Usuário'
  }

  // Obter roles do usuário
  const getUserRoles = () => {
    return user.value?.roles || []
  }

  return {
    // Estado
    user,
    loading,
    error,
    
    // Computed
    isLoggedIn,
    
    // Métodos
    getUserInfo,
    clearUser,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getUserEmail,
    getUserId,
    getUserName,
    getUserRoles
  }
}
