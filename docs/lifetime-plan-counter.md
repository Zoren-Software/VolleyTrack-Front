# 📊 Contador de Planos Vitalícios - Limite de 500 Contas

## ✅ Implementação Completa

Sistema para contabilizar e limitar a venda de planos vitalícios a 500 contas, com exibição em tempo real na listagem de planos.

---

## 🎯 Funcionalidades Implementadas

### Backend (Laravel/PHP)

1. **✅ Rota de Contador** - `GET /v1/customers/lifetime-plans-count`
2. **✅ Validação no Checkout** - Bloqueia compra quando atingir 500
3. **✅ Contagem Inteligente** - Usa `distinct('customer_id')` para contar clientes únicos

### Frontend (Nuxt/Vue)

1. **✅ Service de Consulta** - `lifetimePlanService.js`
2. **✅ Badge de Contador** - Exibe "X/500 disponíveis"
3. **✅ Badge Dinâmico** - Muda cor conforme disponibilidade
4. **✅ Animações** - Pulse diferenciado por urgência

---

## 📡 API - Backend

### Endpoint: Contador de Planos Vitalícios

**URL:** `GET /v1/customers/lifetime-plans-count`

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total_sold": 15,
    "limit": 500,
    "remaining": 485,
    "percentage": 3,
    "is_sold_out": false
  }
}
```

**Campos:**
- `total_sold`: Total de planos vitalícios vendidos (customers únicos)
- `limit`: Limite máximo (500)
- `remaining`: Vagas restantes
- `percentage`: Porcentagem vendida
- `is_sold_out`: Se está esgotado (true/false)

### Implementação - CustomerController

**Arquivo:** `/app/Http/Controllers/CustomerController.php`

```php
public function getLifetimePlansCount(): JsonResponse
{
    $totalSold = \App\Models\Central\Subscription::on('mysql')
        ->where('type', 'one_time_payment')
        ->whereIn('stripe_status', ['succeeded', 'paid', 'complete'])
        ->distinct('customer_id')
        ->count('customer_id');

    $limit = 500;
    $remaining = max(0, $limit - $totalSold);
    $percentage = round(($totalSold / $limit) * 100, 2);
    $isSoldOut = $totalSold >= $limit;

    return response()->json([
        'success' => true,
        'data' => [
            'total_sold' => $totalSold,
            'limit' => $limit,
            'remaining' => $remaining,
            'percentage' => $percentage,
            'is_sold_out' => $isSoldOut
        ]
    ]);
}
```

**Rota Adicionada:** `/routes/v1/api/CustomerRoutes.php`

```php
Route::get('/customers/lifetime-plans-count', [CustomerController::class, 'getLifetimePlansCount']);
```

---

## 🚫 Validação no Checkout

### Implementação - StripeCheckoutController

**Arquivo:** `/app/Http/Controllers/StripeCheckoutController.php`

Adicionado logo no início do método `createCheckoutSession()`, antes da verificação de plano já comprado:

```php
if ($isOneTimePrice && $mode === 'payment') {
    // VERIFICAR LIMITE DE 500 PLANOS VITALÍCIOS
    $totalLifetimePlans = \App\Models\Central\Subscription::on('mysql')
        ->where('type', 'one_time_payment')
        ->whereIn('stripe_status', ['succeeded', 'paid', 'complete'])
        ->distinct('customer_id')
        ->count('customer_id');

    if ($totalLifetimePlans >= 500) {
        return response()->json([
            'success' => false,
            'message' => 'Desculpe, o plano vitalício está esgotado! Atingimos o limite de 500 contas com plano vitalício.',
            'data' => [
                'total_sold' => $totalLifetimePlans,
                'limit' => 500,
                'suggested_action' => 'Considere assinar um de nossos planos mensais ou anuais para ter acesso completo à plataforma.'
            ]
        ], 400);
    }
    
    // ... continua com verificação de plano já comprado
}
```

**Fluxo de Validação:**

```
1. Cliente tenta comprar plano vitalício
   ↓
2. Sistema conta total de planos vendidos
   ↓
3. Se >= 500:
   → Bloqueia compra
   → Retorna erro 400
   → Sugere planos alternativos
   ↓
4. Se < 500:
   → Permite continuar
   → Verifica se cliente já comprou antes
```

---

## 🎨 Frontend - Service

### Arquivo Criado: `/services/lifetimePlanService.js`

**Funções Disponíveis:**

#### 1. `getLifetimePlansCount()`

Busca o contador de planos vitalícios da API.

```javascript
const result = await getLifetimePlansCount()

// Retorno:
{
  success: true,
  data: {
    total_sold: 15,
    limit: 500,
    remaining: 485,
    percentage: 3,
    is_sold_out: false
  }
}
```

#### 2. `checkLifetimePlanAvailability()`

Verifica se o plano vitalício está disponível para compra.

```javascript
const result = await checkLifetimePlanAvailability()

// Retorno quando disponível:
{
  success: true,
  available: true,
  message: 'Plano disponível! 485 vagas restantes.',
  data: { ... }
}

// Retorno quando esgotado:
{
  success: true,
  available: false,
  message: 'Plano vitalício esgotado! Limite de 500 contas atingido.',
  data: { ... }
}
```

#### 3. `formatAvailabilityMessage(totalSold, limit)`

Formata mensagem amigável baseado na disponibilidade.

```javascript
formatAvailabilityMessage(490, 500) // "🔥 Últimas 10 vagas!"
formatAvailabilityMessage(450, 500) // "⚡ Restam apenas 50 vagas"
formatAvailabilityMessage(100, 500) // "✨ 400/500 disponíveis"
formatAvailabilityMessage(500, 500) // "🔴 ESGOTADO"
```

#### 4. `getBadgeColor(totalSold, limit)`

Retorna cor apropriada para o badge.

```javascript
getBadgeColor(500, 500) // 'danger'  (Esgotado)
getBadgeColor(490, 500) // 'warning' (Quase esgotado)
getBadgeColor(350, 500) // 'info'    (Vendendo bem)
getBadgeColor(100, 500) // 'success' (Disponível)
```

---

## 🎨 Frontend - Página de Planos

### Arquivo Modificado: `/pages/payment/index.vue`

#### Badge de Contador

Adicionado badge que exibe disponibilidade do plano vitalício:

```vue
<div
  v-if="plan.metadata?.plan_type === 'lifetime' && lifetimeCounter"
  class="lifetime-counter-badge"
  :class="{
    'counter-danger': lifetimeCounter.is_sold_out,
    'counter-warning': !lifetimeCounter.is_sold_out && lifetimeCounter.remaining <= 50,
    'counter-success': !lifetimeCounter.is_sold_out && lifetimeCounter.remaining > 50
  }"
>
  <span v-if="lifetimeCounter.is_sold_out">🔴 ESGOTADO</span>
  <span v-else-if="lifetimeCounter.remaining <= 10">
    🔥 Últimas {{ lifetimeCounter.remaining }} vagas!
  </span>
  <span v-else-if="lifetimeCounter.remaining <= 50">
    ⚡ Restam {{ lifetimeCounter.remaining }}/{{ lifetimeCounter.limit }}
  </span>
  <span v-else>
    ✨ {{ lifetimeCounter.remaining }}/{{ lifetimeCounter.limit }} disponíveis
  </span>
</div>
```

#### Script Setup

```javascript
import { getLifetimePlansCount } from "~/services/lifetimePlanService.js";

const lifetimeCounter = ref(null);

const loadLifetimeCounter = async () => {
  const result = await getLifetimePlansCount();
  if (result.success) {
    lifetimeCounter.value = result.data;
  }
};

onMounted(async () => {
  await loadPlans();
  await loadLifetimeCounter(); // Carrega contador
});
```

#### Estilos CSS

```css
.lifetime-counter-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 10;
  animation: pulse 2s ease-in-out infinite;
}

.lifetime-counter-badge.counter-success {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.lifetime-counter-badge.counter-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  animation: pulse-warning 1s ease-in-out infinite;
}

.lifetime-counter-badge.counter-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  animation: pulse-danger 0.8s ease-in-out infinite;
}
```

---

## 🎨 Visual do Badge

### Cores e Estados:

#### 1. **Verde (Disponível)** - remaining > 50
```
┌─────────────────────────────┐
│  ✨ 450/500 disponíveis    │ (Verde pulsante suave)
└─────────────────────────────┘
```

#### 2. **Laranja (Baixo Estoque)** - remaining <= 50
```
┌─────────────────────────────┐
│  ⚡ Restam 30/500           │ (Laranja pulsante médio)
└─────────────────────────────┘
```

#### 3. **Laranja Urgente** - remaining <= 10
```
┌─────────────────────────────┐
│  🔥 Últimas 5 vagas!        │ (Laranja pulsante rápido)
└─────────────────────────────┘
```

#### 4. **Vermelho (Esgotado)** - remaining = 0
```
┌─────────────────────────────┐
│  🔴 ESGOTADO                │ (Vermelho pulsante intenso)
└─────────────────────────────┘
```

---

## 🔄 Fluxo Completo

### Cenário 1: Cliente Tenta Comprar (Disponível)

```
1. Cliente abre /payment
   ↓
2. Frontend carrega contador via API
   ↓
3. Badge mostra: "✨ 485/500 disponíveis"
   ↓
4. Cliente clica no plano vitalício
   ↓
5. Backend valida: 485 < 500 ✅
   ↓
6. Checkout continua normalmente
```

### Cenário 2: Cliente Tenta Comprar (Esgotado)

```
1. Cliente abre /payment
   ↓
2. Frontend carrega contador via API
   ↓
3. Badge mostra: "🔴 ESGOTADO"
   ↓
4. Cliente clica no plano vitalício
   ↓
5. Backend valida: 500 >= 500 ❌
   ↓
6. Retorna erro 400:
   "Desculpe, o plano vitalício está esgotado!"
   ↓
7. Frontend exibe mensagem de erro
```

---

## 📊 Estrutura de Dados

### Banco de Dados

**Tabela:** `subscriptions`

**Query de Contagem:**
```sql
SELECT COUNT(DISTINCT customer_id) 
FROM subscriptions 
WHERE type = 'one_time_payment' 
  AND stripe_status IN ('succeeded', 'paid', 'complete');
```

**Por que `distinct('customer_id')`?**
- Garante que cada customer é contado apenas uma vez
- Mesmo que tenha múltiplos registros, conta como 1
- Previne duplicatas

---

## 🧪 Como Testar

### Teste 1: Ver Contador

1. Acesse `/payment`
2. Procure pelo card do **Plano Vitalício**
3. **✅ Deve mostrar badge** no canto superior direito:
   - "✨ X/500 disponíveis"

### Teste 2: API Diretamente

```bash
curl http://api.volleytrack.local/v1/customers/lifetime-plans-count
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": {
    "total_sold": 15,
    "limit": 500,
    "remaining": 485,
    "percentage": 3,
    "is_sold_out": false
  }
}
```

### Teste 3: Limite Atingido

Para simular limite atingido, modifique temporariamente no código:

```php
// StripeCheckoutController.php
if ($totalLifetimePlans >= 1) { // Mudou de 500 para 1
    // Bloqueia compra
}
```

---

## 📁 Arquivos Criados/Modificados

### Backend

- ✅ `/app/Http/Controllers/CustomerController.php` - Método `getLifetimePlansCount()`
- ✅ `/app/Http/Controllers/StripeCheckoutController.php` - Validação de limite
- ✅ `/routes/v1/api/CustomerRoutes.php` - Nova rota

### Frontend

- ✅ `/services/lifetimePlanService.js` - Service completo (novo)
- ✅ `/pages/payment/index.vue` - Badge + carregamento
- ✅ `/docs/lifetime-plan-counter.md` - Esta documentação (novo)

---

## 🎯 Próximos Passos (Opcional)

1. **Analytics**: Rastrear tentativas de compra quando esgotado
2. **Notificação**: Email para admin quando atingir 480/500
3. **Fila de Espera**: Permitir clientes entrarem em lista de espera
4. **Countdown**: Timer mostrando próxima liberação
5. **Cache**: Cachear contador por 5 minutos (reduzir consultas ao DB)

---

## ✅ Checklist de Implementação

- [x] Backend: Rota de contador criada
- [x] Backend: Validação de limite no checkout
- [x] Frontend: Service criado
- [x] Frontend: Badge adicionado na listagem
- [x] Frontend: Animações implementadas
- [x] Frontend: Cores dinâmicas por urgência
- [x] Documentação completa
- [ ] Testes realizados
- [ ] Deploy em produção

---

**Status:** ✅ **IMPLEMENTADO E PRONTO PARA TESTES**

**Última atualização:** 2025-11-28

