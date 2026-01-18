# Stripe Troubleshooting Guide

Este guia ajuda a resolver problemas comuns encontrados na integração com o Stripe.

## Problemas Comuns e Soluções

### 1. Erro: "The Checkout client-only integration is not enabled"

**Sintoma:**
```
IntegrationError: The Checkout client-only integration is not enabled. 
Enable it in the Dashboard at https://dashboard.stripe.com/account/checkout/settings.
```

**Solução:**
1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com/account/checkout/settings)
2. Vá para **Account Settings** → **Checkout Settings**
3. Na seção **Client-only integration**, clique em **Enable**
4. Salve as configurações
5. Aguarde alguns minutos para as mudanças propagarem

### 2. Warnings do Vue sobre propriedades não definidas

**Sintoma:**
```
[Vue warn]: Property "el" was accessed during render but is not defined on instance.
[Vue warn]: Property "memo" was accessed during render but is not defined on instance.
```

**Causa:** Uso de biblioteca `@vue-stripe/vue-stripe` desatualizada
**Solução:** Migrar para `@stripe/stripe-js` (já implementado)

### 3. Erro 400 na API do Stripe

**Sintoma:**
```
POST https://api.stripe.com/v1/payment_pages 400 (Bad Request)
```

**Possíveis causas:**
- Price ID inválido
- Configuração incorreta do produto no Stripe
- Chaves de API incorretas

**Solução:**
1. Verificar se o Price ID existe no Stripe Dashboard
2. Confirmar que o produto está ativo
3. Verificar se as chaves de API estão corretas

### 4. Problemas de Configuração

#### Variáveis de Ambiente
Certifique-se de que o arquivo `.env` contém:

```bash
# Chave pública (pode ser exposta no cliente)
# Usa prefixo NUXT_PUBLIC_ para variáveis públicas
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Chave secreta (apenas servidor)
# Usa prefixo NUXT_ (sem PUBLIC_) para variáveis privadas
NUXT_STRIPE_SECRET_KEY=sk_test_...
```

#### Configuração do Nuxt
O `nuxt.config.ts` deve incluir:

```typescript
runtimeConfig: {
  // Variável privada (apenas servidor) - NÃO exposta no cliente
  // Usa prefixo NUXT_ (sem PUBLIC_) no .env
  stripeSecretKey: '', // NUXT_STRIPE_SECRET_KEY
  
  // Variáveis públicas (acessíveis no cliente)
  // Usam prefixo NUXT_PUBLIC_ no .env
  public: {
    stripePublishableKey: '', // NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  }
}
```

**⚠️ Segurança e Padrão Nuxt 3:**
- Variáveis **privadas** (apenas servidor) usam prefixo `NUXT_` no `.env` (ex: `NUXT_STRIPE_SECRET_KEY`)
- Variáveis **públicas** (cliente + servidor) usam prefixo `NUXT_PUBLIC_` no `.env` (ex: `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- A `stripeSecretKey` nunca deve ter o prefixo `NUXT_PUBLIC_` pois isso a exporia no cliente
- Sem o prefixo `NUXT_` ou `NUXT_PUBLIC_`, as variáveis não serão capturadas pelo `runtimeConfig` em produção

### 5. Verificação de Produtos e Preços

#### No Stripe Dashboard:
1. **Products** → Verificar se os produtos estão ativos
2. **Prices** → Confirmar que os preços estão configurados corretamente
3. **Metadata** → Verificar se os metadados estão preenchidos:
   - `plan_type`: "clubes", "pro", "lifetime"
   - `type`: "monthly", "yearly"

#### Estrutura Esperada:
```json
{
  "id": "prod_...",
  "name": "Plano Pro",
  "metadata": {
    "plan_type": "pro",
    "type": "monthly"
  },
  "prices": {
    "data": [
      {
        "id": "price_...",
        "unit_amount": 9900,
        "recurring": {
          "interval": "month",
          "interval_count": 1
        }
      }
    ]
  }
}
```

### 6. Teste de Integração

#### Cartões de Teste:
- **Sucesso:** `4242 4242 4242 4242`
- **Falha:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

#### Códigos de Verificação:
- **CVC:** Qualquer 3 dígitos (ex: 123)
- **Data:** Qualquer data futura (ex: 12/25)

### 7. Debug e Logs

#### Console do Navegador:
```javascript
// Verificar se o Stripe foi inicializado
console.log('Stripe:', stripe);

// Verificar configurações
console.log('Stripe Key:', stripeKey);
console.log('Line Items:', lineItems.value);
console.log('Checkout Mode:', checkoutMode.value);
```

#### Network Tab:
- Verificar requisições para `api.stripe.com`
- Confirmar que as chaves estão sendo enviadas corretamente

### 8. Comandos Úteis

#### Instalar/Atualizar Dependências:
```bash
# Remover biblioteca antiga
pnpm remove @vue-stripe/vue-stripe

# Instalar biblioteca oficial
pnpm add @stripe/stripe-js

# Limpar cache e reinstalar
pnpm store prune
pnpm install
```

#### Verificar Versões:
```bash
pnpm list @stripe/stripe-js
pnpm list @vue-stripe/vue-stripe
```

### 9. Recursos Adicionais

- [Stripe Checkout Documentation](https://stripe.com/docs/checkout)
- [Stripe JavaScript SDK](https://stripe.com/docs/js)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Support](https://support.stripe.com)

### 10. Checklist de Verificação

- [ ] Client-only integration habilitada no Stripe Dashboard
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Produtos e preços criados no Stripe
- [ ] Metadados configurados corretamente
- [ ] Biblioteca `@stripe/stripe-js` instalada
- [ ] Chaves de API válidas (test/live)
- [ ] URLs de sucesso/cancelamento configuradas
- [ ] Modo de checkout correto (subscription/payment)

## Suporte

Se os problemas persistirem:
1. Verificar logs do console do navegador
2. Confirmar configurações no Stripe Dashboard
3. Testar com cartões de teste
4. Verificar se as chaves de API estão corretas
5. Contatar suporte do Stripe se necessário
