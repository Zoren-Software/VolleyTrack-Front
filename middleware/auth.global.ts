export default defineNuxtRouteMiddleware((to, from, next) => {
    const token = localStorage.getItem('apollo:default.token');
    
    // Verifica se a rota atual é /set-password e se há um email e um token na URL
    const isSetPasswordRoute = to.path.startsWith('/set-password/') && to.params.email && to.params.token;

    if (isSetPasswordRoute) {
        return;
    }
  
    if (to.path !== '/login' && token == null) {
        localStorage.removeItem('apollo:default.token'); // Limpar o token
        return '/login';
    }
    
    if (to.path === '/login' && token != null) {
        return '/';
    }
  });