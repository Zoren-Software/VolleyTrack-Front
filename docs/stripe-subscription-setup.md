# Configuração do Sistema de Assinaturas - Stripe

Este documento explica como configurar e usar o sistema de assinaturas do VoleiClub usando o Stripe.js diretamente.

## 📋 Pré-requisitos

1. Conta no [Stripe](https://stripe.com)
2. Chaves de API do Stripe (pública e secreta)
3. Produtos e preços configurados no dashboard do Stripe

## 🔑 Configuração das Variáveis de Ambiente

1. Copie o arquivo `stripe.config.example` para `.env`:
```bash
cp stripe.config.example .env
```

2. Preencha as variáveis no arquivo `.env`:
```env
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
NODE_ENV=development
```

3. As variáveis serão automaticamente carregadas pelo Nuxt através do `runtimeConfig`.

## 🛍️ Configuração dos Produtos no Stripe

### 1. Criar Produtos

No dashboard do Stripe, crie os seguintes produtos:

- **VoleiClub Básico** - Plano básico para clubes iniciantes
- **VoleiClub Profissional** - Plano intermediário para clubes em crescimento  
- **VoleiClub Empresarial** - Plano avançado para grandes clubes
- **VoleiClub Vitalício** - Plano de pagamento único com funcionalidades limitadas

### 2. Criar Preços Recorrentes e Únicos

Para cada produto, configure os preços conforme a tabela abaixo:

| Plano | Periodicidade | Preço | ID do Preço | Observações |
|-------|---------------|-------|-------------|-------------|
| Básico | Mensal | R$ 29,90 | `price_basic_monthly` | Assinatura recorrente |
| Básico | Anual | R$ 287,04 | `price_basic_yearly` | 20% desconto |
| Profissional | Mensal | R$ 59,90 | `price_pro_monthly` | Assinatura recorrente |
| Profissional | Anual | R$ 575,04 | `price_pro_yearly` | 20% desconto |
| Empresarial | Mensal | R$ 99,90 | `price_enterprise_monthly` | Assinatura recorrente |
| Empresarial | Anual | R$ 959,04 | `price_enterprise_yearly` | 20% desconto |
| Vitalício | Pagamento único | R$ 999,90 | `price_lifetime` | Acesso vitalício |

**Importante**: Anote os IDs dos preços (ex: `price_1ABC123DEF456`)

### 3. Configuração dos Preços no Stripe

#### Preços Mensais:
- **Tipo**: Recurring
- **Intervalo**: Mensal
- **Moeda**: BRL (Real brasileiro)

#### Preços Anuais:
- **Tipo**: Recurring
- **Intervalo**: Anual
- **Moeda**: BRL (Real brasileiro)
- **Desconto**: 20% aplicado automaticamente

#### Preço Vitalício:
- **Tipo**: One-time
- **Moeda**: BRL (Real brasileiro)
- **Sem recorrência**

### 4. Atualizar IDs no Código

No arquivo `pages/payment2/index.vue`, atualize os `priceId` dos planos:

```javascript
const allPlans = ref([
  // Plano Básico
  {
    id: 'basic',
    name: 'Básico',
    billing: 'monthly',
    priceId: 'price_1ABC123DEF456', // Substitua pelo ID real mensal
    price: 29.90,
    // ... resto do código
  },
  {
    id: 'basic',
    name: 'Básico',
    billing: 'yearly',
    priceId: 'price_1ABC123DEF789', // Substitua pelo ID real anual
    price: 287.04,
    discount: 71.76,
    // ... resto do código
  },
  // ... outros planos com seus respectivos priceId
]);
```

## 🚀 Como Funciona

### 1. Seleção da Periodicidade
- Usuário escolhe entre **Mensal** ou **Anual**
- Planos anuais mostram **20% de desconto**
- Plano vitalício aparece independentemente da seleção

### 2. Seleção do Plano
- Usuário visualiza os planos disponíveis para a periodicidade escolhida
- Clica em um plano para selecioná-lo
- O plano selecionado é destacado visualmente

### 3. Processo de Assinatura
- Usuário clica em "Assinar [Plano]"
- O Stripe.js é inicializado automaticamente
- Usuário é redirecionado para o checkout seguro do Stripe

### 4. Fluxo de Pagamento
- Stripe processa o pagamento
- Em caso de sucesso: redireciona para `/payment/success`
- Em caso de cancelamento: redireciona para `/payment/cancel`

## 📱 Páginas Criadas

### `/payment2` - Seleção de Planos
- **Toggle de periodicidade** (Mensal/Anual)
- **6 planos de assinatura** (3 mensais + 3 anuais)
- **1 plano vitalício** (pagamento único)
- Interface interativa para seleção
- Integração direta com Stripe.js

### `/payment/success` - Sucesso na Assinatura
- Confirmação da assinatura
- Detalhes da assinatura
- Links para dashboard e configurações

### `/payment/cancel` - Cancelamento
- Informações sobre o cancelamento
- Opção de tentar novamente
- Links de suporte

## 🎨 Personalização

### Cores e Estilo
As cores principais podem ser alteradas no CSS:
- **Primária**: `#667eea` (azul)
- **Sucesso**: `#10b981` (verde)
- **Erro**: `#ef4444` (vermelho)
- **Desconto**: `#f59e0b` (laranja)
- **Vitalício**: `#8b5cf6` (roxo)

### Planos e Preços
Para alterar os planos, edite o array `allPlans` em `pages/payment2/index.vue`.

### Funcionalidades
Cada plano pode ter diferentes recursos listados no array `features`.

## 🔧 Desenvolvimento

### Modo Debug
Para ativar informações de debug, altere no código:
```javascript
const showDebug = ref(true); // Ativa informações de debug
```

### Testes
Use as chaves de teste do Stripe para desenvolvimento:
- Chaves começam com `pk_test_` e `sk_test_`
- Use cartões de teste do Stripe para simular pagamentos

## 💰 Estrutura de Preços

### Cálculo dos Descontos Anuais
- **Básico**: R$ 29,90 × 12 × 0,8 = R$ 287,04 (economia de R$ 71,76)
- **Profissional**: R$ 59,90 × 12 × 0,8 = R$ 575,04 (economia de R$ 143,76)
- **Empresarial**: R$ 99,90 × 12 × 0,8 = R$ 959,04 (economia de R$ 239,76)

### Plano Vitalício
- **Preço único**: R$ 999,90
- **Funcionalidades limitadas** (máximo 10 jogadores)
- **Sem atualizações futuras**
- **Suporte por 1 ano**

## 📞 Suporte

Para dúvidas ou problemas:
- **Email**: suporte@voleiclub.com
- **Telefone**: (11) 99999-9999
- **Documentação Stripe**: [stripe.com/docs](https://stripe.com/docs)

## ⚠️ Importante

1. **Nunca** commite chaves secretas no repositório
2. Use sempre variáveis de ambiente para configurações sensíveis
3. Teste sempre em ambiente de desenvolvimento antes de ir para produção
4. Configure webhooks do Stripe para notificações de eventos importantes
5. **Configure corretamente os preços anuais** com desconto no Stripe
6. **O sistema usa Stripe.js diretamente** para melhor compatibilidade

## 🚀 Próximos Passos

1. Configurar webhooks do Stripe
2. Implementar gestão de assinaturas no backend
3. Adicionar funcionalidades específicas por plano
4. Implementar sistema de upgrade/downgrade de planos
5. Adicionar relatórios de faturamento
6. Implementar sistema de trial gratuito
7. Adicionar opções de pagamento adicionais (PIX, boleto)
