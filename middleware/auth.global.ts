
export default defineNuxtRouteMiddleware((to, from, next) => {
  const token = localStorage.getItem('apollo:default.token')
  
  if (to.path != '/login' && token == null) {
      localStorage.removeItem('apollo:default.token') // Limpar o token
      return '/login'
  }
  
  if (to.path == '/login' && token != null) {
      return '/'
  }
})