/**
 * Composable para verificação de permissões do usuário.
 * Lê as permissões salvas no localStorage (carregadas pelo useUser).
 */
export const usePermission = () => {
  const hasPermission = (permissionName) => {
    try {
      const stored = localStorage.getItem('user')
      if (!stored) return false
      const user = JSON.parse(stored)
      return user?.permissions?.some((p) => p.name === permissionName) ?? false
    } catch {
      return false
    }
  }

  /**
   * Verifica se o usuário pode criar/editar/excluir jogadores.
   * Requer a permissão 'edit-user'. O backend garante que o player
   * só pode editar o próprio perfil (via UserPolicy).
   */
  const canEditPlayer = () => hasPermission('edit-user') && !isPlayer()

  /**
   * Verifica se o usuário logado é um player (somente visualização).
   */
  const isPlayer = () => {
    try {
      const stored = localStorage.getItem('user')
      if (!stored) return false
      const user = JSON.parse(stored)
      return user?.roles?.some((r) => r.name === 'player') ?? false
    } catch {
      return false
    }
  }

  return {
    hasPermission,
    canEditPlayer,
    isPlayer,
  }
}
