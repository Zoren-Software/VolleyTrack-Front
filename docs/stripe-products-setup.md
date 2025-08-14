# Configuração de Produtos e Preços no Stripe

Este guia explica passo a passo como configurar os produtos e preços no dashboard do Stripe para o sistema de assinaturas do VoleiClub.

## 🎯 Produtos a Serem Criados

### 1. VoleiClub Básico
- **Nome**: VoleiClub Básico
- **Descrição**: Plano básico para clubes iniciantes com gestão essencial
- **Categoria**: Software/SaaS
- **Imagem**: (opcional) Logo do VoleiClub

### 2. VoleiClub Profissional
- **Nome**: VoleiClub Profissional
- **Descrição**: Plano intermediário para clubes em crescimento
- **Categoria**: Software/SaaS
- **Imagem**: (opcional) Logo do VoleiClub

### 3. VoleiClub Empresarial
- **Nome**: VoleiClub Empresarial
- **Descrição**: Plano avançado para grandes clubes e federações
- **Categoria**: Software/SaaS
- **Imagem**: (opcional) Logo do VoleiClub

### 4. VoleiClub Vitalício
- **Nome**: VoleiClub Vitalício
- **Descrição**: Plano de pagamento único com funcionalidades limitadas
- **Categoria**: Software/SaaS
- **Imagem**: (opcional) Logo do VoleiClub

## 💰 Configuração dos Preços

### Passo 1: Acessar o Dashboard
1. Faça login no [dashboard do Stripe](https://dashboard.stripe.com)
2. Certifique-se de estar no modo de teste (toggle "Test mode")

### Passo 2: Criar Produtos
1. No menu lateral, clique em **Products**
2. Clique em **Add product**

#### Para o VoleiClub Básico:
```
Nome: VoleiClub Básico
Descrição: Plano básico para clubes iniciantes com gestão essencial de treinos, até 20 jogadores, relatórios simples e suporte por email.
```

#### Para o VoleiClub Profissional:
```
Nome: VoleiClub Profissional
Descrição: Plano intermediário para clubes em crescimento. Inclui gestão avançada de treinos, até 50 jogadores, relatórios detalhados, scouting técnico e suporte prioritário.
```

#### Para o VoleiClub Empresarial:
```
Nome: VoleiClub Empresarial
Descrição: Plano avançado para grandes clubes e federações. Jogadores ilimitados, todas as funcionalidades Pro, API personalizada, suporte 24/7 e relatórios customizados.
```

#### Para o VoleiClub Vitalício:
```
Nome: VoleiClub Vitalício
Descrição: Plano de pagamento único com funcionalidades limitadas. Acesso vitalício para até 10 jogadores, gestão básica de treinos e relatórios simples.
```

### Passo 3: Configurar Preços

Para cada produto, configure os preços conforme a tabela:

#### VoleiClub Básico:
```
Preço Mensal:
- Tipo: Recurring
- Preço: R$ 29,90
- Moeda: BRL (Real brasileiro)
- Intervalo: Mensal

Preço Anual:
- Tipo: Recurring
- Preço: R$ 287,04
- Moeda: BRL (Real brasileiro)
- Intervalo: Anual
- Desconto: 20% aplicado automaticamente
```

#### VoleiClub Profissional:
```
Preço Mensal:
- Tipo: Recurring
- Preço: R$ 59,90
- Moeda: BRL (Real brasileiro)
- Intervalo: Mensal

Preço Anual:
- Tipo: Recurring
- Preço: R$ 575,04
- Moeda: BRL (Real brasileiro)
- Intervalo: Anual
- Desconto: 20% aplicado automaticamente
```

#### VoleiClub Empresarial:
```
Preço Mensal:
- Tipo: Recurring
- Preço: R$ 99,90
- Moeda: BRL (Real brasileiro)
- Intervalo: Mensal

Preço Anual:
- Tipo: Recurring
- Preço: R$ 959,04
- Moeda: BRL (Real brasileiro)
- Intervalo: Anual
- Desconto: 20% aplicado automaticamente
```

#### VoleiClub Vitalício:
```
Preço Único:
- Tipo: One-time
- Preço: R$ 999,90
- Moeda: BRL (Real brasileiro)
- Sem recorrência
```

### Passo 4: Configurações Avançadas (Opcional)

Para cada preço, você pode configurar:

- **Trial period**: Período de teste gratuito (ex: 7 dias)
- **Billing thresholds**: Limites de faturamento
- **Tax behavior**: Comportamento de impostos
- **Metadata**: Dados adicionais para identificação

**Importante**: Para preços anuais, configure o desconto de 20% diretamente no Stripe ou calcule o preço final.

## 🔑 Obter IDs dos Preços

Após criar os preços, você receberá IDs únicos:

1. No dashboard, vá para **Products**
2. Clique no produto desejado
3. Na seção **Pricing**, você verá todos os preços criados
4. O ID do preço aparece como `price_1ABC123DEF456...`

**Anote esses IDs!** Você precisará deles para o código.

## 📝 Exemplo de Configuração Completa

### Produto: VoleiClub Básico
```
ID do Produto: prod_1ABC123DEF456
Nome: VoleiClub Básico
Descrição: Plano básico para clubes iniciantes
```

### Preços:
```
Preço Mensal:
ID: price_1ABC123DEF456
Valor: R$ 29,90
Moeda: BRL
Intervalo: Mensal
Tipo: Recurring

Preço Anual:
ID: price_1ABC123DEF789
Valor: R$ 287,04
Moeda: BRL
Intervalo: Anual
Tipo: Recurring
```

## 🔄 Atualizar o Código

Com os IDs obtidos, atualize o arquivo `pages/payment2/index.vue`:

```javascript
const allPlans = ref([
  // Plano Básico
  {
    id: 'basic',
    name: 'Básico',
    billing: 'monthly',
    priceId: 'price_1ABC123DEF456', // Substitua pelo ID real mensal
    price: 29.90,
    description: 'Plano ideal para clubes iniciantes',
    features: [
      'Até 20 jogadores',
      'Gestão básica de treinos',
      'Relatórios simples',
      'Suporte por email'
    ],
    popular: false
  },
  {
    id: 'basic',
    name: 'Básico',
    billing: 'yearly',
    priceId: 'price_1ABC123DEF789', // Substitua pelo ID real anual
    price: 287.04,
    discount: 71.76,
    description: 'Plano ideal para clubes iniciantes',
    features: [
      'Até 20 jogadores',
      'Gestão básica de treinos',
      'Relatórios simples',
      'Suporte por email'
    ],
    popular: false
  },
  // ... outros planos com seus respectivos priceId
]);
```

## 🧪 Testando

### Cartões de Teste
Use estes cartões para testar:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Cenários de Teste
1. **Assinatura mensal bem-sucedida**: Use cartão válido
2. **Assinatura anual bem-sucedida**: Use cartão válido
3. **Pagamento vitalício bem-sucedido**: Use cartão válido
4. **Falha no pagamento**: Use cartão inválido
5. **Cancelamento**: Feche a janela do checkout
6. **3D Secure**: Use cartão que requer autenticação

## 💡 Dicas de Configuração

### Preços Anuais com Desconto
Para aplicar o desconto de 20% nos preços anuais:

1. **Opção 1**: Configure o preço final já com desconto no Stripe
2. **Opção 2**: Use coupons do Stripe para aplicar desconto automaticamente
3. **Opção 3**: Calcule o preço final: `preço_mensal × 12 × 0,8`

### Plano Vitalício
- Configure como **One-time payment**
- Não marque como recorrente
- Use metadata para identificar como plano vitalício

## ⚠️ Importante

1. **Sempre teste em modo de teste primeiro**
2. **Nunca use chaves de produção para testes**
3. **Mantenha os IDs dos preços seguros**
4. **Configure webhooks para notificações**
5. **Teste todos os fluxos antes de ir para produção**
6. **Verifique se os preços anuais estão com desconto correto**
7. **Confirme que o plano vitalício é one-time**

## 🚀 Próximos Passos

1. Configurar webhooks do Stripe
2. Implementar gestão de assinaturas no backend
3. Adicionar funcionalidades específicas por plano
4. Implementar sistema de upgrade/downgrade
5. Configurar relatórios de faturamento
6. Implementar sistema de trial gratuito
7. Adicionar opções de pagamento adicionais (PIX, boleto)

## 📞 Suporte Stripe

- **Documentação**: [stripe.com/docs](https://stripe.com/docs)
- **Suporte**: [support.stripe.com](https://support.stripe.com)
- **Comunidade**: [stripe.com/community](https://stripe.com/community)
- **Webhooks**: [stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
