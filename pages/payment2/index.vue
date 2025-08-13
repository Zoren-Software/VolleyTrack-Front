<template>
  <div class="payment-test-page">
    <div class="container">
      <h1>Teste do Stripe Elements</h1>
      <p>Testando o componente Stripe Elements personalizado</p>

      <!-- Debug info -->
      <div
        class="debug-info"
        style="
          background: #f0f0f0;
          padding: 15px;
          margin: 20px 0;
          border-radius: 8px;
        "
      >
        <h4>Debug Info:</h4>
        <p><strong>Stripe Key:</strong> {{ stripeKey }}</p>
        <p><strong>Client Secret:</strong> {{ clientSecret }}</p>
        <p><strong>Currency:</strong> {{ currency }}</p>
        <p><strong>Loading:</strong> {{ loading }}</p>
        <button
          @click="testStripeKey"
          style="
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          Testar Chave Stripe
        </button>
      </div>

      <!-- Componente de pagamento inline para teste -->
      <div class="stripe-elements-form">
        <div class="payment-card">
          <div class="card-header">
            <h3>Pagamento com Stripe Elements</h3>
          </div>

          <div class="card-body">
            <div v-if="loading" class="loading">
              <p>Carregando formulário de pagamento...</p>
              <p
                v-if="statusMessage"
                class="status-message"
                :class="statusType"
              >
                {{ statusMessage }}
              </p>
            </div>

            <div v-else>
              <!-- Formulário de pagamento usando Stripe Elements -->
              <div id="card-element" class="card-element"></div>

              <!-- Botão de pagamento -->
              <div class="payment-actions">
                <button
                  :disabled="processing || !stripe || !elements"
                  @click="handleSubmit"
                  class="payment-button"
                >
                  <span v-if="processing">Processando...</span>
                  <span v-else>Pagar {{ formatCurrency(5000) }}</span>
                </button>
              </div>

              <!-- Informações do produto -->
              <div class="product-info">
                <h4>Resumo do Pedido</h4>
                <div class="product-item">
                  <span>Produto: Pacote Premium VoleiClub</span>
                  <span class="price">{{ formatCurrency(5000) }}</span>
                </div>
                <div class="total">
                  <strong>Total: {{ formatCurrency(5000) }}</strong>
                </div>
              </div>

              <!-- Mensagens de status -->
              <div v-if="statusMessage" :class="['status-message', statusType]">
                {{ statusMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultado do pagamento -->
      <div v-if="paymentResult" class="payment-result">
        <h3>Resultado do Pagamento:</h3>
        <pre>{{ JSON.stringify(paymentResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";

// Configurações do Stripe
const runtimeConfig = useRuntimeConfig();
const stripeKey = runtimeConfig.public.stripePublishableKey;

// Para teste, vamos usar um clientSecret mockado
// Em produção, isso viria do seu backend quando criar um PaymentIntent
// O clientSecret deve começar com "pi_" (PaymentIntent)
const clientSecret = ref("pi_test_secret_123456789");

// Constantes
const currency = ref("BRL");

const paymentResult = ref(null);
const loading = ref(true);
const processing = ref(false);
const statusMessage = ref("");
const statusType = ref("");
const stripe = ref(null);
const elements = ref(null);
const cardElement = ref(null);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.value,
  }).format(value / 100);
};

const testStripeKey = () => {
  console.log("=== TESTE DA CHAVE STRIPE ===");
  console.log(stripeKey);

  // Tentar usar a chave diretamente
  if (window.Stripe) {
    try {
      const testStripe = window.Stripe(stripeKey);
      console.log("Stripe criado com sucesso:", testStripe);
    } catch (error) {
      console.error("Erro ao criar Stripe:", error);
    }
  } else {
    console.log("Stripe.js ainda não foi carregado");
  }
};

const handleSubmit = async () => {
  if (!stripe.value || !elements.value) {
    return;
  }

  processing.value = true;
  statusMessage.value = "";

  try {
    const { error } = await stripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      statusMessage.value = error.message || "Erro ao processar pagamento.";
      statusType.value = "error";
      paymentResult.value = {
        status: "error",
        error: error,
        timestamp: new Date().toISOString(),
      };
    } else {
      statusMessage.value = "Pagamento realizado com sucesso!";
      statusType.value = "success";
      paymentResult.value = {
        status: "success",
        data: { amount: 5000 },
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    statusMessage.value = "Erro ao processar pagamento.";
    statusType.value = "error";
    paymentResult.value = {
      status: "error",
      error: error,
      timestamp: new Date().toISOString(),
    };
  } finally {
    processing.value = false;
  }
};

const handlePaymentSuccess = (result) => {
  console.log("Pagamento realizado com sucesso:", result);
  paymentResult.value = {
    status: "success",
    data: result,
    timestamp: new Date().toISOString(),
  };
};

const handlePaymentError = (error) => {
  console.error("Erro no pagamento:", error);
  paymentResult.value = {
    status: "error",
    error: error,
    timestamp: new Date().toISOString(),
  };
};

onMounted(async () => {
  try {
    console.log("=== INICIANDO CONFIGURAÇÃO DO STRIPE ===");
    console.log("Stripe Key:", stripeKey);
    console.log("Client Secret:", clientSecret.value);
    console.log("Currency:", currency.value);

    // Verificar se temos uma chave válida
    if (!stripeKey || stripeKey === "undefined") {
      throw new Error("Chave do Stripe não configurada ou inválida");
    }

    // Aguardar o Stripe.js carregar
    if (!window.Stripe) {
      console.log("Carregando Stripe.js...");
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      console.log("Stripe.js carregado com sucesso");
    }

    // Primeiro, parar o loading para renderizar o elemento
    loading.value = false;
    console.log("Loading parado, elemento deve estar renderizado");

    // Aguardar o próximo tick para garantir que o DOM está renderizado
    await nextTick();
    console.log("nextTick completado");

    // Pequeno delay para garantir que o DOM está completamente renderizado
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log("Delay de 200ms completado");

    // Verificar se o elemento existe
    const cardElementDom = document.getElementById("card-element");
    if (!cardElementDom) {
      throw new Error("Elemento #card-element não encontrado no DOM");
    }
    console.log("Elemento #card-element encontrado:", cardElementDom);

    // Inicializar Stripe
    console.log("Inicializando Stripe...", stripeKey);
    stripe.value = window.Stripe(stripeKey);
    console.log("Stripe inicializado:", stripe.value);

    // Configurar Elements
    const appearance = {
      theme: "flat",
      variables: {
        colorPrimaryText: "#262626",
        colorPrimary: "#667eea",
      },
    };

    console.log("Configurando Elements...");
    elements.value = stripe.value.elements({
      clientSecret: clientSecret.value,
      appearance,
    });
    console.log("Elements configurado:", elements.value);

    // Criar elemento de cartão
    console.log("Criando elemento de cartão...");
    cardElement.value = elements.value.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
    });

    // Montar elemento na tela
    console.log("Montando elemento na tela...");
    cardElement.value.mount("#card-element");
    console.log("Elemento montado com sucesso");

    console.log("=== CONFIGURAÇÃO COMPLETA ===");
    console.log("Formulário pronto!");
  } catch (error) {
    console.error("=== ERRO NA CONFIGURAÇÃO ===");
    console.error("Erro ao inicializar Stripe Elements:", error);
    console.error("Stack trace:", error.stack);
    statusMessage.value =
      "Erro ao carregar formulário de pagamento: " + error.message;
    statusType.value = "error";
    loading.value = false;
  }
});
</script>

<style scoped>
.payment-test-page {
  padding: 40px 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}

.stripe-elements-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 40px;
}

.payment-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.card-header {
  background-color: #f0f2f5;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.card-body {
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.card-element {
  margin-bottom: 20px;
}

.payment-actions {
  text-align: center;
  margin-top: 20px;
}

.payment-button {
  background-color: #667eea;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.payment-button:hover:not(:disabled) {
  background-color: #5a67d8;
}

.payment-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  color: #4a5568;
}

.product-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #e0e0e0;
}

.product-info h4 {
  margin-bottom: 15px;
  color: #333;
}

.product-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #555;
}

.product-item span:first-child {
  font-weight: bold;
}

.product-item .price {
  font-weight: bold;
  color: #667eea;
}

.total {
  margin-top: 10px;
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.status-message {
  margin-top: 20px;
  padding: 12px 15px;
  border-radius: 6px;
  font-weight: bold;
  text-align: center;
}

.status-message.success {
  background-color: #e6f6ea;
  color: #2f9e44;
  border: 1px solid #d3f9d8;
}

.status-message.error {
  background-color: #fde3e3;
  color: #c92a2a;
  border: 1px solid #f5d0d0;
}

.payment-result {
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.payment-result h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.payment-result pre {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 14px;
  color: #333;
}
</style>
