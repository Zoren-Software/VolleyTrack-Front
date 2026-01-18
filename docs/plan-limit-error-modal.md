# 🚨 Sistema de Modal de Erro de Limite de Plano

## 📋 Visão Geral

Sistema automático para detectar e exibir erros de limite de plano (usuários e times) com um modal customizado e bonito, incluindo botão animado para upgrade.

---

## 🎯 Funcionalidades

- ✅ **Detecção Automática**: Intercepta erros GraphQL de limite de plano
- ✅ **Modal Customizado**: Design moderno com animações suaves
- ✅ **Botão Animado**: Botão de upgrade com efeitos visuais atrativos
- ✅ **Informações Detalhadas**: Mostra limite atual, máximo e plano ativo
- ✅ **Redirecionamento**: Leva o usuário para a página de planos automaticamente
- ✅ **Fácil de Usar**: Funciona automaticamente em todo o sistema

---

## 🏗️ Arquitetura

### Arquivos Criados

1. **`/components/PlanLimitErrorModal.vue`**
   - Componente modal com design customizado
   - Animações CSS avançadas
   - Botão de upgrade com efeitos visuais

2. **`/composables/usePlanLimitError.js`**
   - Composable para gerenciar estado do modal
   - Funções para detectar e parsear erros de limite
   - Estado global reativo

3. **`/plugins/planLimitErrorHandler.client.ts`**
   - Plugin Nuxt para interceptação automática de erros
   - Tratamento de erros não capturados
   - Disponibiliza funcionalidade globalmente

4. **`/utils/graphql/mutationHandler.js`**
   - Wrapper para mutations GraphQL
   - Detecta automaticamente erros de limite
   - Fallback para erros padrão

5. **`/layouts/default.vue`** (modificado)
   - Inclui o modal globalmente
   - Disponível em todas as páginas

---

## 🚀 Como Usar

### Método 1: Automático (Recomendado)

O sistema funciona automaticamente! Quando uma mutation GraphQL retornar um erro de limite de plano, o modal será exibido automaticamente.

```javascript
// Em qualquer componente Vue
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup() {
    const createUser = async () => {
      try {
        const { mutate } = useMutation(gql`
          mutation UserCreate($name: String!) {
            userCreate(name: $name) {
              id
              name
            }
          }
        `)
        
        await mutate({ variables: { name: 'João Silva' } })
        
      } catch (error) {
        // O erro de limite de plano será tratado automaticamente
        // Você só precisa tratar outros erros específicos aqui
        console.error('Erro:', error)
      }
    }
    
    return { createUser }
  }
}
```

### Método 2: Usando o Wrapper (Recomendado para Controle Adicional)

```javascript
import { handleMutation } from '~/utils/graphql/mutationHandler'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup() {
    const createUser = async () => {
      await handleMutation(
        async () => {
          const { mutate } = useMutation(USER_CREATE_MUTATION, { 
            variables: { name: 'João Silva' } 
          })
          return await mutate()
        },
        {
          onSuccess: (data) => {
            console.log('✅ Usuário criado:', data)
            // Atualizar lista, fechar modal, etc.
          },
          onError: (error) => {
            // Este callback é chamado APÓS o modal de limite (se aplicável)
            console.error('❌ Erro ao criar usuário:', error)
          }
        }
      )
    }
    
    return { createUser }
  }
}
```

### Método 3: Controle Manual

```javascript
import { usePlanLimitError } from '~/composables/usePlanLimitError'

export default {
  setup() {
    const { showModal, handleGraphQLError } = usePlanLimitError()
    
    // Exibir modal manualmente
    const showLimitError = () => {
      showModal({
        type: 'users',
        message: 'Você atingiu o limite de 24 usuários do seu plano atual.',
        current: 24,
        max: 24,
        planName: 'Plano Pro'
      })
    }
    
    // Ou tratar erro GraphQL manualmente
    const handleError = (error) => {
      const wasHandled = handleGraphQLError(error)
      
      if (!wasHandled) {
        // Não era erro de limite de plano, tratar de outra forma
        console.error('Outro tipo de erro:', error)
      }
    }
    
    return { showLimitError, handleError }
  }
}
```

---

## 🎨 Personalização do Modal

### Estrutura de Dados

```javascript
{
  type: 'users' | 'teams',        // Tipo do erro
  message: String,                 // Mensagem principal
  current: Number,                 // Quantidade atual
  max: Number,                     // Limite máximo
  planName: String,                // Nome do plano atual
  fullMessage: String              // Mensagem completa do backend
}
```

### Eventos

```vue
<PlanLimitErrorModal
  v-model="isOpen"
  :error-data="errorData"
  @upgrade-clicked="handleUpgrade"
  @update:modelValue="handleClose"
/>
```

---

## 🔍 Detecção de Erros

O sistema detecta automaticamente mensagens de erro que contenham:

### Para Usuários:
- "Você atingiu o limite de X usuário"
- "Atualmente você tem X usuário"

### Para Times:
- "Você atingiu o limite de X time"
- "Atualmente você tem X time"

### Regex Patterns:
```javascript
// Usuários
/Você atingiu o limite de (\d+) usuário/
/Atualmente você tem (\d+) usuário/

// Times
/Você atingiu o limite de (\d+) time/
/Atualmente você tem (\d+) time/
```

---

## 🎭 Animações

O modal inclui várias animações:

1. **Entrada/Saída**: Fade + Scale
2. **Ícone**: Bounce animado
3. **Pulse Ring**: Anel pulsante ao redor do ícone
4. **Botão Upgrade**: 
   - Hover: Lift effect
   - Ícone: Float up/down
   - Sparkles: Efeitos de brilho animados
5. **Background**: Gradiente rotativo

---

## 🎯 Fluxo de Usuário

1. **Usuário tenta criar recurso** (usuário ou time)
2. **Backend valida** e retorna erro de limite
3. **Sistema detecta** automaticamente o erro
4. **Modal é exibido** com informações detalhadas
5. **Usuário clica "Fazer Upgrade"**
6. **Redirecionamento** para `/payment` (página de planos)
7. **Usuário escolhe** novo plano e faz upgrade

---

## 📱 Responsividade

O modal é totalmente responsivo:

- **Desktop**: Layout padrão com botões lado a lado
- **Mobile**: Layout vertical com botões empilhados
- **Tablet**: Adapta-se automaticamente

---

## 🐛 Debugging

Para debug, você pode:

```javascript
// 1. Verificar estado do modal
import { usePlanLimitError } from '~/composables/usePlanLimitError'

const { isModalOpen, errorData } = usePlanLimitError()
console.log('Modal aberto?', isModalOpen.value)
console.log('Dados do erro:', errorData.value)

// 2. Testar detecção de erro
const { parsePlanLimitError } = usePlanLimitError()
const result = parsePlanLimitError(error)
console.log('Erro detectado?', result !== null)

// 3. Forçar exibição do modal
const { showModal } = usePlanLimitError()
showModal({
  type: 'users',
  message: 'Teste de mensagem',
  current: 10,
  max: 24,
  planName: 'Plano Pro'
})
```

---

## ✅ Checklist de Implementação

- [x] Componente modal criado
- [x] Composable implementado
- [x] Plugin de interceptação configurado
- [x] Wrapper de mutation criado
- [x] Layout default atualizado
- [x] Documentação completa
- [ ] Testes realizados com usuários
- [ ] Testes realizados com times
- [ ] Testes de responsividade
- [ ] Testes de acessibilidade

---

## 🔮 Melhorias Futuras

1. **Analytics**: Rastrear quantas vezes o modal é exibido
2. **A/B Testing**: Testar diferentes mensagens e CTAs
3. **Preview do Plano**: Mostrar preview do próximo plano no modal
4. **Desconto**: Oferecer desconto no upgrade quando o limite é atingido
5. **Customização**: Permitir customizar cores e textos via config

---

## 🤝 Contribuindo

Para adicionar novos tipos de limite (ex: treinos, jogadores):

1. Adicionar detecção no `parsePlanLimitError()` do composable
2. Adicionar tradução no backend (`PlanLimits.php`)
3. Testar o fluxo completo

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Verificar console do navegador
- Verificar logs do backend
- Verificar se o plugin está carregado
- Verificar se o modal está no layout

---

**Última atualização**: 2025-11-28

