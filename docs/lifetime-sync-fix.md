# Correção de Sincronização do Plano Vitalício

## Problema Identificado

O contador de planos vitalícios mostrava **0/500** quando deveria mostrar **499/500**, e o badge "Já Comprado" não aparecia para usuários com plano vitalício.

## Causa Raiz

O pagamento vitalício (`one_time_payment`) do Stripe não foi sincronizado corretamente no banco de dados local durante o checkout inicial. O PaymentIntent foi registrado no Stripe com status `succeeded`, mas não criou o registro correspondente na tabela `subscriptions` com `type = 'one_time_payment'`.

## Solução Implementada

### 1. Investigação no Stripe

Buscamos os PaymentIntents do customer no Stripe e encontramos:

```bash
Payment ID: pi_3SXu1kQ9JxqxFgoP1orVmaVY
Amount: 250 BRL
Status: succeeded
Price ID: price_1SXtvqQ9JxqxFgoPfQ0ZpvEp
Type: one_time
Product: Plano Vitalício
```

### 2. Comando de Sincronização Criado

**Arquivo:** `VoleiClub/app/Console/Commands/SyncLifetimePayments.php`

Comando que:
- Busca PaymentIntents do Stripe para um customer específico ou todos
- Identifica pagamentos do tipo `one_time` com status `succeeded`
- Sincroniza produtos e prices no banco local
- Cria registros em `subscriptions` com `type = 'one_time_payment'`
- Cria `subscription_items` associados

**Uso:**

```bash
# Sincronizar customer específico
php artisan stripe:sync-lifetime-payments --customer=email@example.com

# Sincronizar todos os customers
php artisan stripe:sync-lifetime-payments --all
```

### 3. Correção Manual Aplicada

Para o customer `support@volleytrack.com`:

1. **Subscription criada:**
```sql
ID: 2
Type: one_time_payment
Stripe ID: pi_3SXu1kQ9JxqxFgoP1orVmaVY
Status: succeeded
```

2. **SubscriptionItem criado:**
```sql
ID: 2
Subscription ID: 2
Product ID: 7 (Plano Vitalício)
Price ID: 7 (R$ 250,00)
```

### 4. Estrutura de Dados Corrigida

**Tabela `subscriptions`:**
- `type` = `'one_time_payment'` (não `'subscription'`)
- `stripe_id` = PaymentIntent ID (não Subscription ID)
- `stripe_status` = `'succeeded'` (status do payment)
- `stripe_price` = Price ID do produto
- `current_period_start` = Data do pagamento
- `current_period_end` = `null` (não tem período para one_time)

**Tabela `subscription_items`:**
- `subscription_id` = ID local da subscription
- `subscription_stripe_id` = Stripe ID (PaymentIntent)
- `product_id` = ID local do produto
- `stripe_product_id` = Stripe Product ID
- `price_id` = ID local do price
- `stripe_price_id` = Stripe Price ID
- `quantity` = 1

## Resultados

### Contador de Planos Vitalícios

**Antes:**
```json
{
  "total_sold": 0,
  "remaining": 500
}
```

**Depois:**
```json
{
  "total_sold": 1,
  "remaining": 499
}
```

### API Active Plan

O endpoint `/v1/customers/active-plan` agora retorna:

```json
{
  "has_active_plan": true,
  "has_purchased_lifetime": true,
  "lifetime_plan": {
    "subscription": { ... },
    "product": {
      "name": "Plano Vitalício",
      "metadata": {
        "plan_type": "lifetime",
        "max_players": "12",
        "max_teams": "1"
      }
    },
    "price": {
      "type": "one_time",
      "unit_amount": 25000
    }
  }
}
```

### Badge "Já Comprado"

O badge agora aparece corretamente porque:
1. `activePlanData.lifetime_plan` existe ✅
2. `activePlanData.has_purchased_lifetime = true` ✅
3. A função `hasPurchasedLifetimePlan()` retorna `true` ✅

## Query do Contador

```php
$totalSold = \App\Models\Central\Subscription::on('mysql')
    ->where('type', 'one_time_payment')
    ->whereIn('stripe_status', ['succeeded', 'paid', 'complete'])
    ->distinct('customer_id')
    ->count('customer_id');
```

Esta query conta **customers únicos** que compraram planos vitalícios com pagamento bem-sucedido.

## Prevenção de Problemas Futuros

### 1. Webhook do Stripe

Certifique-se de que o webhook `payment_intent.succeeded` está configurado para:
- Criar automaticamente o registro `one_time_payment` em `subscriptions`
- Criar o `subscription_item` associado
- Atualizar o cache do active plan

### 2. Sincronização Periódica

Agendar o comando de sincronização para rodar diariamente:

```php
// app/Console/Kernel.php
$schedule->command('stripe:sync-lifetime-payments --all')
    ->daily()
    ->at('03:00');
```

### 3. Monitoramento

- Verificar discrepâncias entre contagem no Stripe vs banco local
- Alertar se houver PaymentIntents `succeeded` sem registro correspondente
- Validar integridade dos dados de `subscription_items`

## Comando de Verificação

Criado comando para debugar lifetime plans:

```bash
php artisan customer:check-lifetime email@example.com
```

Mostra:
- Informações do customer
- Todas as subscriptions
- Pagamentos vitalícios específicos
- Status dos subscription items
- Resultado da query da API

## Arquivos Modificados

1. **Backend:**
   - `app/Console/Commands/SyncLifetimePayments.php` (novo)
   - `app/Console/Commands/CheckLifetimePurchase.php` (existente)

2. **Frontend:**
   - Nenhuma modificação necessária (já estava correto)

## Teste Manual

1. **Contador:**
```bash
curl http://api.volleytrack.local/v1/customers/lifetime-plans-count
```

2. **Active Plan:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://api.volleytrack.local/v1/customers/active-plan?tenant_id=test"
```

3. **Frontend:**
   - Acessar `/payment`
   - Verificar badge "💎 Já Comprado" no card do plano vitalício
   - Verificar contador "499/500 disponíveis"
   - Botão deve estar desabilitado com texto "💎 Plano Vitalício já comprado"

## Status

✅ **Problema Resolvido:**
- Contador corrigido: 1/500 vendidos
- Badge "Já Comprado" aparecendo
- API retornando dados corretos
- Bloqueio de compra duplicada funcionando

🔄 **Próximos Passos:**
- Implementar webhook automático
- Agendar sincronização periódica
- Adicionar monitoramento de discrepâncias

