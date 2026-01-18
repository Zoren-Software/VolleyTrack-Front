# Composable useUser

Este composable gerencia as informações do usuário logado na aplicação, fornecendo uma interface consistente para acessar dados do usuário e verificar permissões.

## Funcionalidades

### Estado
- `user`: Dados do usuário logado
- `loading`: Estado de carregamento
- `error`: Erros ocorridos

### Métodos
- `getUserInfo()`: Carrega informações do usuário
- `clearUser()`: Limpa dados do usuário (logout)
- `getUserEmail()`: Retorna email do usuário
- `getUserId()`: Retorna ID do usuário
- `getUserName()`: Retorna nome do usuário
- `getUserRoles()`: Retorna roles do usuário

### Verificações de Permissão
- `hasRole(roleName)`: Verifica se usuário tem role específico
- `hasAnyRole(roleNames)`: Verifica se usuário tem qualquer um dos roles
- `hasAllRoles(roleNames)`: Verifica se usuário tem todos os roles

### Computed
- `isLoggedIn`: Verifica se usuário está logado

## Uso Básico

```vue
<script setup>
import { useUser } from '~/composables/useUser'

const { user, getUserInfo, getUserEmail, isLoggedIn } = useUser()

// Carregar informações do usuário
onMounted(async () => {
  await getUserInfo()
})

// Usar dados do usuário
const userEmail = getUserEmail()
const isUserLoggedIn = isLoggedIn.value
</script>

<template>
  <div v-if="isLoggedIn">
    <p>Bem-vindo, {{ user.name }}!</p>
    <p>Email: {{ user.email }}</p>
  </div>
  <div v-else>
    <p>Usuário não logado</p>
  </div>
</template>
```

## Uso com Stripe

```vue
<script setup>
const { getUserEmail } = useUser()

const subscribeToPlan = async () => {
  const checkoutOptions = {
    mode: 'subscription',
    lineItems: lineItems.value,
    successUrl: successURL,
    cancelUrl: cancelURL,
    customerEmail: getUserEmail() || 'customer@example.com', // Email do usuário logado
  }
  
  // ... resto da lógica
}
</script>
```

## Verificação de Roles

```vue
<script setup>
const { hasRole, hasAnyRole, hasAllRoles } = useUser()

// Verificar role específico
const isAdmin = hasRole('admin')
const isManager = hasRole('manager')

// Verificar múltiplos roles
const isStaff = hasAnyRole(['admin', 'manager', 'staff'])
const isSuperUser = hasAllRoles(['admin', 'manager'])
</script>

<template>
  <div v-if="hasRole('admin')">
    <p>Painel de Administrador</p>
  </div>
  
  <div v-if="hasAnyRole(['admin', 'manager'])">
    <p>Funcionalidades de Gestão</p>
  </div>
</template>
```

## Estrutura dos Dados do Usuário

```javascript
{
  id: "1",
  name: "João Silva",
  email: "joao@example.com",
  emailVerifiedAt: "2024-01-15T10:30:00Z",
  roles: [
    {
      id: "1",
      name: "admin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Integração com localStorage

O composable automaticamente:
1. Tenta carregar dados do localStorage primeiro
2. Se não encontrar, faz query GraphQL
3. Salva dados no localStorage para uso futuro
4. Limpa dados no logout

## Tratamento de Erros

```vue
<script setup>
const { user, loading, error, getUserInfo } = useUser()

onMounted(async () => {
  try {
    await getUserInfo()
  } catch (err) {
    console.error('Erro ao carregar usuário:', err)
  }
})
</script>

<template>
  <div v-if="loading">Carregando...</div>
  <div v-else-if="error">Erro: {{ error }}</div>
  <div v-else-if="user">
    <p>Usuário: {{ user.name }}</p>
  </div>
</template>
```

## Exemplo Completo

```vue
<template>
  <div class="user-profile">
    <div v-if="loading" class="loading">
      Carregando informações do usuário...
    </div>
    
    <div v-else-if="error" class="error">
      Erro: {{ error }}
      <button @click="retryLoad">Tentar novamente</button>
    </div>
    
    <div v-else-if="isLoggedIn" class="user-info">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      
      <div class="roles">
        <h3>Roles:</h3>
        <ul>
          <li v-for="role in user.roles" :key="role.id">
            {{ role.name }}
          </li>
        </ul>
      </div>
      
      <div class="actions">
        <button v-if="hasRole('admin')" @click="adminPanel">
          Painel Admin
        </button>
        
        <button v-if="hasAnyRole(['admin', 'manager'])" @click="managementPanel">
          Gestão
        </button>
        
        <button @click="logout">Logout</button>
      </div>
    </div>
    
    <div v-else class="not-logged">
      <p>Usuário não logado</p>
      <router-link to="/login">Fazer Login</router-link>
    </div>
  </div>
</template>

<script setup>
import { useUser } from '~/composables/useUser'

const { 
  user, 
  loading, 
  error, 
  isLoggedIn, 
  getUserInfo, 
  clearUser,
  hasRole,
  hasAnyRole 
} = useUser()

const retryLoad = async () => {
  await getUserInfo()
}

const logout = () => {
  clearUser()
  // Redirecionar para login
}

const adminPanel = () => {
  // Navegar para painel admin
}

const managementPanel = () => {
  // Navegar para painel de gestão
}

onMounted(async () => {
  await getUserInfo()
})
</script>
```

## Notas Importantes

1. **Auto-importação**: O composable é automaticamente importado pelo Nuxt
2. **Reatividade**: Todos os valores retornados são reativos
3. **Cache**: Dados são cacheados no localStorage
4. **GraphQL**: Usa a query `me` para buscar dados do usuário
5. **Tratamento de Erros**: Inclui tratamento robusto de erros
6. **TypeScript**: Compatível com TypeScript (se configurado)

## Troubleshooting

### Usuário não carrega
- Verificar se o token está no localStorage
- Verificar se a query GraphQL está funcionando
- Verificar console para erros

### Roles não aparecem
- Verificar se o usuário tem roles atribuídos
- Verificar estrutura da resposta GraphQL
- Verificar se os metadados estão corretos

### Erro de autenticação
- Verificar se o token é válido
- Verificar se o usuário ainda existe
- Verificar permissões no backend
