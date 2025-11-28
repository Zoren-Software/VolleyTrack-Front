# 🎨 Correção Visual: Contador de Planos Vitalícios

## 🐛 Problema Identificado

O badge do contador estava **sobrepondo outros badges** no topo do card, causando uma aparência desorganizada.

### Antes (Ruim):
```
┌─────────────────────────────────────┐
│  Pagamento Único                    │ ← Badge 1
│  🎁 OFERTA ESPECIAL                 │ ← Badge 2
│      ✨ 485/500 disponíveis ←─┐    │ ← Badge 3 (SOBREPONDO!)
│                              │     │
└──────────────────────────────┘─────┘
```

---

## ✅ Solução Aplicada

**Integrei o contador na seção "LIMITES E BENEFÍCIOS"**, eliminando sobreposição e criando uma visualização limpa e organizada.

### Depois (Bom):
```
┌─────────────────────────────────────┐
│  Pagamento Único                    │
│  🎁 OFERTA ESPECIAL                 │
│                                     │
│  R$ 250,00                          │
│  Economia de 83%                    │
│                                     │
│  ✓ Gestão limitada de jogadores    │
│  ✓ Controle de presença             │
│  ✓ Relatórios e estatísticas        │
│  ✓ Acesso vitalício                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  LIMITES E BENEFÍCIOS       │   │
│  ├─────────────────────────────┤   │
│  │  👥          🏐             │   │
│  │  JOGADORES   TIMES          │   │
│  │  12 jogadores  1 time       │   │
│  ├─────────────────────────────┤   │ ← NOVO!
│  │  ✨ DISPONIBILIDADE         │   │
│  │  485/500 disponíveis        │   │
│  └─────────────────────────────┘   │
│                                     │
│       [Selecionado]                 │
└─────────────────────────────────────┘
```

---

## 🎨 Implementação

### HTML/Template

**Arquivo:** `/pages/payment/index.vue`

```vue
<!-- Limites e Benefícios -->
<div v-if="hasPlanLimits(plan)" class="plan-limits">
  <h4 class="limits-title">Limites e Benefícios</h4>
  
  <div class="limits-grid">
    <!-- Jogadores -->
    <div class="limit-item">
      <span class="limit-icon">👥</span>
      <div class="limit-content">
        <span class="limit-label">Jogadores</span>
        <span class="limit-value">12 jogadores</span>
      </div>
    </div>
    
    <!-- Times -->
    <div class="limit-item">
      <span class="limit-icon">🏐</span>
      <div class="limit-content">
        <span class="limit-label">Times</span>
        <span class="limit-value">1 time</span>
      </div>
    </div>
  </div>
  
  <!-- NOVO: Disponibilidade integrada -->
  <div
    v-if="plan.metadata?.plan_type === 'lifetime' && lifetimeCounter"
    class="lifetime-availability"
    :class="{
      'availability-danger': lifetimeCounter.is_sold_out,
      'availability-warning': lifetimeCounter.remaining <= 50,
      'availability-success': lifetimeCounter.remaining > 50
    }"
  >
    <div class="availability-icon">
      <span v-if="lifetimeCounter.is_sold_out">🔴</span>
      <span v-else-if="lifetimeCounter.remaining <= 10">🔥</span>
      <span v-else-if="lifetimeCounter.remaining <= 50">⚡</span>
      <span v-else>✨</span>
    </div>
    <div class="availability-content">
      <span class="availability-label">Disponibilidade</span>
      <span class="availability-value">
        {{ lifetimeCounter.remaining }}/{{ lifetimeCounter.limit }} disponíveis
      </span>
    </div>
  </div>
</div>
```

---

## 🎨 Estilos CSS

### Layout da Seção de Disponibilidade

```css
.lifetime-availability {
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}
```

### Cores por Estado

#### Verde (Disponível) - remaining > 50
```css
.availability-success {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
}

.availability-success .availability-value {
  color: #059669;
}
```

#### Laranja (Baixo Estoque) - remaining <= 50
```css
.availability-warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #f59e0b;
  animation: pulse-glow 2s ease-in-out infinite;
}

.availability-warning .availability-value {
  color: #d97706;
}
```

#### Vermelho (Esgotado) - remaining = 0
```css
.availability-danger {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #ef4444;
  animation: pulse-glow 1.5s ease-in-out infinite;
}

.availability-danger .availability-value {
  color: #dc2626;
}
```

### Animação Suave

```css
@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
```

---

## 📊 Estados Visuais

### 1. Verde - Disponível (> 50 vagas)

```
┌───────────────────────────────────┐
│  ✨  DISPONIBILIDADE              │  (Verde suave)
│     485/500 disponíveis           │  (Texto verde escuro)
└───────────────────────────────────┘
```

### 2. Laranja - Baixo Estoque (11-50 vagas)

```
┌───────────────────────────────────┐
│  ⚡  DISPONIBILIDADE              │  (Laranja suave, pulsando)
│     30/500                        │  (Texto laranja escuro)
└───────────────────────────────────┘
```

### 3. Laranja Urgente - Últimas Vagas (1-10 vagas)

```
┌───────────────────────────────────┐
│  🔥  DISPONIBILIDADE              │  (Laranja intenso, pulsando rápido)
│     Últimas 5 vagas!              │  (Texto laranja escuro)
└───────────────────────────────────┘
```

### 4. Vermelho - Esgotado (0 vagas)

```
┌───────────────────────────────────┐
│  🔴  DISPONIBILIDADE              │  (Vermelho suave, pulsando intenso)
│     ESGOTADO                      │  (Texto vermelho escuro)
└───────────────────────────────────┘
```

---

## 🔄 Estrutura Hierárquica

```
Card do Plano Vitalício
├── Badges (topo)
│   ├── "Pagamento Único"
│   └── "🎁 Oferta Especial"
│
├── Header
│   ├── Nome do plano
│   ├── Preço
│   └── Economia
│
├── Descrição
│
├── Features (lista)
│
├── Limites e Benefícios        ← Seção organizada
│   ├── Grid 2 colunas
│   │   ├── Jogadores (12)
│   │   └── Times (1)
│   │
│   └── Disponibilidade         ← NOVO! Integrado aqui
│       ├── Ícone (✨/⚡/🔥/🔴)
│       └── Texto (X/500)
│
└── Botão de Ação
```

---

## ✅ Vantagens da Nova Abordagem

### 1. **Organização Visual**
- ✅ Nenhuma sobreposição
- ✅ Hierarquia clara
- ✅ Fluxo de leitura natural

### 2. **Contexto Semântico**
- ✅ Contador integrado aos limites
- ✅ Faz sentido ver disponibilidade junto com limites
- ✅ Informação relacionada agrupada

### 3. **Responsividade**
- ✅ Funciona em mobile/tablet/desktop
- ✅ Não quebra em telas pequenas
- ✅ Escala bem com conteúdo

### 4. **UX Melhorado**
- ✅ Menos poluição visual no topo
- ✅ Informação onde o usuário espera
- ✅ Cores e ícones claros por urgência

---

## 📱 Responsividade

### Desktop (> 768px)
```
┌──────────────────────────────┐
│  LIMITES E BENEFÍCIOS        │
│  ┌──────────┐  ┌──────────┐  │
│  │    👥    │  │    🏐    │  │
│  │ Jogadores│  │  Times   │  │
│  │    12    │  │    1     │  │
│  └──────────┘  └──────────┘  │
│  ┌──────────────────────────┐│
│  │ ✨ DISPONIBILIDADE       ││
│  │ 485/500 disponíveis      ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────────┐
│ LIMITES E BENEFÍCIOS│
│ ┌────────┬────────┐ │
│ │   👥   │   🏐  │ │
│ │Jogadores│ Times│ │
│ │   12   │   1  │ │
│ └────────┴────────┘ │
│ ┌─────────────────┐ │
│ │✨ DISPONIBILIDADE││
│ │485/500 disponív.││
│ └─────────────────┘ │
└────────────────────┘
```

---

## 🎯 Resultado

### Antes ❌
- Badge flutuante sobrepondo outros elementos
- Poluição visual
- Confusão na hierarquia
- Dificuldade de leitura

### Depois ✅
- Contador integrado na seção correta
- Visual limpo e organizado
- Hierarquia clara
- Fácil de entender e ler

---

## 📁 Arquivos Modificados

- ✅ `/pages/payment/index.vue` - Template + Estilos
- ✅ `/docs/lifetime-counter-visual-fix.md` - Esta documentação

---

## 🧪 Como Testar

1. **Abra a página de planos**: `/payment`
2. **Localize o card "Plano Vitalício"**
3. **Verifique a seção "LIMITES E BENEFÍCIOS"**
4. **✅ Deve aparecer:**
   - Grid com Jogadores e Times (2 colunas)
   - Logo abaixo: seção de Disponibilidade com cor/ícone dinâmico
   - Sem sobreposição de elementos
   - Visual limpo e organizado

---

**Status:** ✅ **CORRIGIDO E VISUAL LIMPO**

**Última atualização:** 2025-11-28

