# Scout Técnico de Voleibol

Este conjunto de componentes implementa uma interface completa para avaliação técnica de jogadores de voleibol, seguindo os padrões de design do projeto VoleiClub.

## Componentes

### ZTechnicalScout (Organismo Principal)

O componente principal que gerencia toda a interface de scout técnico.

**Características:**
- Sidebar com lista de jogadores
- Área principal com avaliação de fundamentos
- Sistema de contadores A, B, C para cada fundamento
- Campo para observações técnicas
- Resumo estatístico da avaliação

**Props:**
```javascript
{
  initialPlayers: {
    type: Array,
    default: () => []
  }
}
```

**Emits:**
```javascript
{
  'save-evaluation': (evaluationData) => {
    // evaluationData contém:
    // - playerId: ID do jogador
    // - playerName: Nome do jogador
    // - evaluations: Objeto com avaliações por fundamento
    // - observations: Observações técnicas
    // - timestamp: Data/hora da avaliação
  }
}
```

### ZFundamentalCard (Molécula)

Card individual para cada fundamento técnico.

**Props:**
```javascript
{
  fundamental: {
    type: Object,
    required: true
    // Contém: id, name, icon, legend
  },
  evaluation: {
    type: Object,
    default: () => ({ a: 0, b: 0, c: 0 })
  }
}
```

**Emits:**
```javascript
{
  'update-evaluation': (fundamentalId, type, value) => {
    // fundamentalId: ID do fundamento
    // type: 'a', 'b' ou 'c'
    // value: Novo valor do contador
  }
}
```

### ZEvaluationSummary (Molécula)

Componente que exibe estatísticas e resumo da avaliação.

**Props:**
```javascript
{
  evaluations: {
    type: Object,
    default: () => ({})
    // Objeto com avaliações por fundamento
  }
}
```

## Fundamentos Técnicos

O sistema inclui 6 fundamentos principais:

1. **Saque** - Avaliação da técnica de saque
2. **Recepção** - Avaliação da recepção de saque
3. **Ataque** - Avaliação da técnica de ataque
4. **Bloqueio** - Avaliação da técnica de bloqueio
5. **Defesa** - Avaliação da técnica de defesa
6. **Levantamento** - Avaliação da técnica de levantamento

## Sistema de Avaliação

Cada fundamento é avaliado usando três categorias:

- **A (Verde)** - Excelente/Perfeito
- **B (Laranja)** - Regular/Aceitável
- **C (Vermelho)** - Erro/Precisa melhorar

### Exemplo de Uso

```vue
<template>
  <ZTechnicalScout @save-evaluation="handleSaveEvaluation" />
</template>

<script setup>
import ZTechnicalScout from '~/components/organisms/Scout/ZTechnicalScout.vue'

const handleSaveEvaluation = (evaluationData) => {
  console.log('Avaliação:', evaluationData)
  // Implementar lógica de salvamento
}
</script>
```

### Dados de Exemplo

```javascript
{
  playerId: 1,
  playerName: "Maicon Souza",
  evaluations: {
    saque: { a: 5, b: 3, c: 1 },
    recepcao: { a: 4, b: 2, c: 0 },
    ataque: { a: 6, b: 2, c: 2 },
    bloqueio: { a: 3, b: 4, c: 1 },
    defesa: { a: 4, b: 3, c: 1 },
    levantamento: { a: 5, b: 2, c: 0 }
  },
  observations: "Jogador com excelente técnica de saque e ataque...",
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

## Responsividade

O componente é totalmente responsivo:
- **Desktop**: Layout em duas colunas (sidebar + conteúdo)
- **Mobile**: Layout em coluna única com sidebar compacta

## Integração com Backend

Para integrar com o backend, implemente a lógica no evento `save-evaluation`:

```javascript
const handleSaveEvaluation = async (evaluationData) => {
  try {
    // Chamada para API
    await $fetch('/api/scout-evaluations', {
      method: 'POST',
      body: evaluationData
    })
    
    // Notificação de sucesso
    showSuccessMessage('Avaliação salva com sucesso!')
  } catch (error) {
    // Tratamento de erro
    showErrorMessage('Erro ao salvar avaliação')
  }
}
``` 