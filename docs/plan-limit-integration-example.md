# 📝 Exemplo de Integração: Modal de Limite de Plano

## Exemplo Prático: Formulário de Criação de Usuário

Este documento mostra como integrar o sistema de modal de limite de plano em um componente existente.

---

## 🎯 Cenário

Queremos que quando o usuário tentar criar um novo usuário e atingir o limite do plano, o modal customizado apareça automaticamente.

---

## 📄 Arquivo: `ZUserForm.vue`

### Antes (Tratamento Padrão de Erro)

```vue
<script>
export default {
  methods: {
    async salvarUsuario() {
      try {
        this.loading = true;
        
        const mutation = gql`${USER_CREATE}`;
        const variables = {
          name: this.form.name,
          email: this.form.email,
          // ... outros campos
        };

        const { mutate } = useMutation(mutation, { variables });
        await mutate();

        confirmSuccess('Usuário criado com sucesso!');
        this.$emit('success');
        
      } catch (error) {
        console.error(error);
        
        // Tratamento genérico de erro
        if (error.graphQLErrors?.[0]?.extensions?.validation) {
          const errors = error.graphQLErrors[0].extensions.validation;
          const footer = Object.values(errors).map(v => v[0]).join('<br>');
          confirmError('Erro ao criar usuário!', footer);
        } else {
          confirmError('Erro ao criar usuário!');
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

### Depois (Com Detecção Automática de Limite)

```vue
<script>
import { handleMutation } from '~/utils/graphql/mutationHandler';

export default {
  methods: {
    async salvarUsuario() {
      this.loading = true;
      
      try {
        await handleMutation(
          async () => {
            const mutation = gql`${USER_CREATE}`;
            const variables = {
              name: this.form.name,
              email: this.form.email,
              // ... outros campos
            };

            const { mutate } = useMutation(mutation, { variables });
            return await mutate();
          },
          {
            onSuccess: (data) => {
              confirmSuccess('Usuário criado com sucesso!');
              this.$emit('success', data);
            },
            onError: (error) => {
              // Este callback só é chamado para erros que NÃO são de limite
              // Erros de limite de plano já foram tratados pelo modal
              console.error('Erro ao criar usuário:', error);
            },
            errorTitle: 'Erro ao criar usuário'
          }
        );
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

---

## 🎨 Versão Composition API (Vue 3)

```vue
<script setup>
import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import { handleMutation } from '~/utils/graphql/mutationHandler';
import { confirmSuccess } from '~/utils/sweetAlert2/swalHelper';
import gql from 'graphql-tag';

const loading = ref(false);
const form = ref({
  name: '',
  email: '',
  // ... outros campos
});

const emit = defineEmits(['success']);

const salvarUsuario = async () => {
  loading.value = true;
  
  try {
    await handleMutation(
      async () => {
        const mutation = gql`
          mutation UserCreate($name: String!, $email: String!) {
            userCreate(name: $name, email: $email) {
              id
              name
              email
            }
          }
        `;

        const { mutate } = useMutation(mutation, {
          variables: {
            name: form.value.name,
            email: form.value.email
          }
        });

        return await mutate();
      },
      {
        onSuccess: (data) => {
          confirmSuccess('Usuário criado com sucesso!');
          emit('success', data);
        },
        errorTitle: 'Erro ao criar usuário'
      }
    );
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="salvarUsuario">
    <!-- Campos do formulário -->
    <button type="submit" :disabled="loading">
      {{ loading ? 'Salvando...' : 'Salvar' }}
    </button>
  </form>
</template>
```

---

## 🔄 Fluxo Completo

### 1. Usuário Preenche Formulário
```
Nome: João Silva
Email: joao@example.com
```

### 2. Clica em "Salvar"
- Loading inicia
- Mutation é enviada ao backend

### 3. Backend Valida
```php
// Backend detecta que já tem 24 usuários e o limite é 24
return "Você atingiu o limite de 24 usuários do seu plano atual. 
        Atualmente você tem 24 usuário(s) cadastrado(s). 
        Para adicionar mais itens, faça upgrade do seu plano.";
```

### 4. Frontend Detecta
```javascript
// O handleMutation detecta automaticamente
const planLimitError = parsePlanLimitError(error);
// => { type: 'users', message: '...', current: 24, max: 24 }
```

### 5. Modal Aparece
```
┌─────────────────────────────────┐
│     ⚠️  (com animação)          │
│                                 │
│  Limite de Usuários Atingido   │
│                                 │
│  Você atingiu o limite de 24   │
│  usuários do seu plano atual... │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Seu plano: Plano Pro    │   │
│  │ Usuários: 24/24         │   │
│  └─────────────────────────┘   │
│                                 │
│  [Fechar] [🚀 Fazer Upgrade]   │
└─────────────────────────────────┘
```

### 6. Usuário Clica "Fazer Upgrade"
- Modal fecha
- Redireciona para `/payment`
- Usuário vê planos disponíveis

---

## 🎯 Integração em Outros Componentes

### Criação de Time

```javascript
// components/organisms/Forms/Team/ZTeamForm.vue
import { handleMutation } from '~/utils/graphql/mutationHandler';

async salvarTime() {
  await handleMutation(
    async () => {
      const { mutate } = useMutation(TEAM_CREATE, { 
        variables: { name: this.form.name } 
      });
      return await mutate();
    },
    {
      onSuccess: () => confirmSuccess('Time criado!'),
      errorTitle: 'Erro ao criar time'
    }
  );
}
```

### Edição de Usuário (Não Afeta Limite)

```javascript
// A edição geralmente não afeta o limite, apenas a criação
async editarUsuario() {
  await handleMutation(
    async () => {
      const { mutate } = useMutation(USER_EDIT, { 
        variables: { id: this.userId, ...this.form } 
      });
      return await mutate();
    },
    {
      onSuccess: () => confirmSuccess('Usuário atualizado!'),
      errorTitle: 'Erro ao atualizar usuário'
    }
  );
}
```

---

## 🧪 Testando

### Teste Manual

1. **Configurar Plano de Teste**:
   - Criar plano no Stripe com `max_players: "2"`
   - Assinar esse plano

2. **Criar Primeiro Usuário**:
   - Deve funcionar normalmente

3. **Criar Segundo Usuário**:
   - Deve funcionar normalmente

4. **Criar Terceiro Usuário**:
   - Modal deve aparecer automaticamente
   - Verificar informações exibidas
   - Testar botão de upgrade

### Teste com Console

```javascript
// No console do navegador
import { usePlanLimitError } from '~/composables/usePlanLimitError'

const { showModal } = usePlanLimitError()

// Simular erro de limite de usuários
showModal({
  type: 'users',
  message: 'Você atingiu o limite de 24 usuários do seu plano atual. Atualmente você tem 24 usuário(s) cadastrado(s).',
  current: 24,
  max: 24,
  planName: 'Plano Pro'
})
```

---

## 📊 Comparação

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Detecção** | Manual em cada componente | Automática |
| **Design** | Alert padrão do SweetAlert | Modal customizado |
| **UX** | Apenas mensagem de erro | Informações + CTA upgrade |
| **Manutenção** | Repetitivo | Centralizado |
| **Animações** | Simples | Avançadas |
| **Conversão** | Baixa | Alta (botão destaque) |

---

## ✅ Benefícios

1. **Menos Código**: Não precisa tratar erros de limite em cada componente
2. **Consistência**: Mesmo design e comportamento em todo o sistema
3. **UX Melhor**: Modal bonito e informativo
4. **Mais Conversões**: Botão de upgrade bem destacado
5. **Fácil Manutenção**: Mudanças em um só lugar

---

## 🚨 Importante

- O sistema **não** sobrescreve tratamentos de erro customizados
- Erros que **não** são de limite continuam sendo tratados normalmente
- O modal **só** aparece para erros específicos de limite de plano
- Funciona tanto com **Options API** quanto **Composition API**

---

**Última atualização**: 2025-11-28

