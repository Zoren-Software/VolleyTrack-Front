<template>
  <div class="active-plan-page">
    <div class="container">
      <div class="page-header">
        <h1>Meu Plano</h1>
        <p>Gerencie sua assinatura e veja os detalhes do seu plano ativo</p>
      </div>

      <div class="plan-section">
        <ActivePlanChecker
          :auto-refresh="true"
          :refresh-interval="60000"
          :tenant-id="getTenantId()"
          @plan-loaded="onPlanLoaded"
          @plan-error="onPlanError"
          @plan-updated="onPlanUpdated"
        />
      </div>

      <div class="additional-info">
        <h2>Informações Adicionais</h2>
        <div class="info-cards">
          <div class="info-card">
            <h3>Como funciona?</h3>
            <p>
              Seu plano é renovado automaticamente no final de cada período de
              cobrança.
            </p>
          </div>
          <div class="info-card">
            <h3>Cancelamento</h3>
            <p>
              Você pode cancelar sua assinatura a qualquer momento através do
              portal de cobrança.
            </p>
          </div>
          <div class="info-card">
            <h3>Suporte</h3>
            <p>
              Precisa de ajuda? Entre em contato conosco através do chat ou
              email.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ActivePlanChecker from "~/components/ActivePlanChecker.vue";

// Head
useHead({
  title: "Meu Plano - VoleiClub",
});

// Função para obter tenant_id (salvo pelo middleware Apollo)
const getTenantId = () => {
  if (process.client) {
    const storedTenant = localStorage.getItem("tenant_id");
    if (storedTenant) {
      return storedTenant;
    }
    return "default";
  }
  return "default";
};

// Event handlers
const onPlanLoaded = (planData) => {
  console.log("Plano carregado:", planData);
  if (planData) {
    console.log("✅ Cliente possui plano ativo");
  } else {
    console.log("ℹ️ Cliente não possui plano ativo");
  }
};

const onPlanError = (error) => {
  console.error("Erro ao carregar plano:", error);
  // Aqui você pode implementar notificações de erro
};

const onPlanUpdated = () => {
  console.log("Plano atualizado automaticamente");
  // Aqui você pode implementar notificações de atualização
};
</script>

<style scoped>
.active-plan-page {
  padding: 40px 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: #1f2937;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.page-header p {
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
}

.plan-section {
  margin-bottom: 50px;
}

.additional-info {
  margin-top: 50px;
}

.additional-info h2 {
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 30px;
  text-align: center;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.info-card h3 {
  color: #1f2937;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.info-card p {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* Responsividade */
@media (max-width: 768px) {
  .active-plan-page {
    padding: 20px 15px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .info-cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .info-card {
    padding: 20px;
  }
}
</style>
