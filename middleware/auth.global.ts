
export default defineNuxtRouteMiddleware((to, from, next) => {
  const token = localStorage.getItem('apollo:default.token')
  
  if (to.path != '/login' && token == null) {
      return '/login'
  }
  
  if (to.path == '/login' && token != null) {
      return '/'
  }
})