<template>
  <div class="test-stripe">
    <h1>Teste da Integração com Stripe</h1>

    <div class="status">
      <p><strong>Status do Stripe:</strong> {{ stripeStatus }}</p>
      <p>
        <strong>Chave configurada:</strong> {{ hasStripeKey ? "Sim" : "Não" }}
      </p>
    </div>

    <div v-if="stripe" class="stripe-info">
      <h3>✅ Stripe carregado com sucesso!</h3>
      <p>Ambiente: {{ stripeEnvironment }}</p>
    </div>

    <div v-else class="stripe-error">
      <h3>❌ Stripe não foi carregado</h3>
      <p>Verifique o console para mais detalhes</p>
    </div>

    <div class="test-components">
      <h3>Teste dos Componentes</h3>

      <!-- Componente simples -->
      <ZStripeSimple :amount="5000" />

      <!-- Componente de cartão -->
      <ZStripeCardForm :amount="7500" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import ZStripeSimple from "~/components/molecules/Payment/ZStripeSimple.vue";
import ZStripeCardForm from "~/components/molecules/Payment/ZStripeCardForm.vue";

// Estado
const stripe = ref(null);
const stripeStatus = ref("Carregando...");
const hasStripeKey = ref(false);

// Computed
const stripeEnvironment = computed(() => {
  if (!stripe.value) return "N/A";

  const runtimeConfig = useRuntimeConfig();
  const clientPublishableKey = runtimeConfig.public.stripePublishableKey;
  const key = clientPublishableKey || "";

  if (key.includes("_test_")) return "Teste";
  if (key.includes("_live_")) return "Produção";
  return "Desconhecido";
});

// Lifecycle
onMounted(() => {
  // Aguarda um pouco para o plugin carregar
  setTimeout(() => {
    const { $stripe } = useNuxtApp();

    if ($stripe) {
      stripe.value = $stripe;
      stripeStatus.value = "Carregado";
      hasStripeKey.value = true;
      console.log("✅ Stripe disponível:", $stripe);
    } else {
      stripeStatus.value = "Não carregado";
      hasStripeKey.value = false;
      console.error("❌ Stripe não disponível");
    }
  }, 1000);
});
</script>

<style scoped>
.test-stripe {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.status {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.stripe-info {
  background: #e8f5e8;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #c8e6c9;
}

.stripe-error {
  background: #ffebee;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #ffcdd2;
}

.test-components {
  margin-top: 32px;
}

.test-components h3 {
  margin-bottom: 16px;
  color: #333;
}
</style>
