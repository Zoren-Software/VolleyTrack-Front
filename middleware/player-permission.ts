/**
 * Middleware para proteger rotas de criação e edição de jogadores.
 * Redireciona para /players caso o usuário não tenha permissão de edição.
 *
 * Regras:
 * - Admin e Técnico: acesso permitido (possuem 'edit-user' e não são players)
 * - Player: acesso negado (pode ter 'edit-user', mas é restrito pelo isPlayer())
 * - Não autenticado: redirecionado pelo middleware auth.global.ts
 */
export default defineNuxtRouteMiddleware(() => {
  const { canEditPlayer } = usePermission()

  if (!canEditPlayer()) {
    return navigateTo('/players')
  }
})
