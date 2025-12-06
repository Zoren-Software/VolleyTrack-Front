<template>
  <div class="tenant-deleted-container">
    <div class="tenant-deleted-card">
      <div class="icon-container">
        <span class="icon">🗑️</span>
      </div>

      <h1 class="title">Conta Excluída</h1>

      <p class="message">
        Sua conta foi excluída devido à inatividade após o período de trial.
      </p>

      <div class="details">
        <p class="detail-text">
          <strong>O que aconteceu?</strong><br />
          Seu período de trial expirou e após 90 dias sem contratação de um
          plano, sua conta foi automaticamente excluída conforme nossa política
          de inatividade.
        </p>

        <p class="detail-text">
          <strong>Posso recuperar meus dados?</strong><br />
          Infelizmente, após a exclusão definitiva, não é possível recuperar os
          dados que foram armazenados em sua conta.
        </p>

        <p class="detail-text">
          <strong>Quer criar uma nova conta?</strong><br />
          Você pode criar uma nova conta a qualquer momento e começar um novo
          período de trial de 14 dias.
        </p>
      </div>

      <div class="actions">
        <button @click="goToLogin" class="btn btn-primary">
          Criar Nova Conta
        </button>
        <button @click="clearSession" class="btn btn-secondary">
          Limpar Sessão e Sair
        </button>
      </div>

      <div v-if="errorInfo" class="error-info">
        <details>
          <summary>Detalhes técnicos (para suporte)</summary>
          <pre>{{ JSON.stringify(errorInfo, null, 2) }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const errorInfo = ref(null);

onMounted(() => {
  // Tentar recuperar informações do erro do localStorage
  const storedError = localStorage.getItem("tenantDeletedError");
  if (storedError) {
    try {
      errorInfo.value = JSON.parse(storedError);
    } catch (e) {
      console.error("Erro ao parsear erro armazenado:", e);
    }
  }
});

const goToLogin = () => {
  // Limpar tokens e redirecionar para login
  clearSession();
  window.location.href = "/login";
};

const clearSession = () => {
  // Limpar todos os dados de autenticação
  localStorage.removeItem("apollo:default.token");
  localStorage.removeItem("userToken");
  localStorage.removeItem("tenantDeletedError");
  localStorage.removeItem("customer_id");
  localStorage.removeItem("activePlanData");

  // Limpar cookies relacionados
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });

  // Se já estiver na página de login, apenas recarregar
  if (window.location.pathname === "/login") {
    window.location.reload();
  }
};
</script>

<style scoped>
.tenant-deleted-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.tenant-deleted-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 48px;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.icon-container {
  margin-bottom: 24px;
}

.icon {
  font-size: 80px;
  display: inline-block;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 16px 0;
}

.message {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.details {
  text-align: left;
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  margin: 32px 0;
}

.detail-text {
  margin: 0 0 20px 0;
  color: #374151;
  line-height: 1.6;
  font-size: 0.95rem;
}

.detail-text:last-child {
  margin-bottom: 0;
}

.detail-text strong {
  color: #1f2937;
  display: block;
  margin-bottom: 8px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 32px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  min-width: 160px;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.error-info {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  text-align: left;
}

.error-info details {
  cursor: pointer;
  color: #6b7280;
  font-size: 0.875rem;
}

.error-info summary {
  margin-bottom: 12px;
  font-weight: 500;
}

.error-info pre {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.75rem;
  color: #374151;
  margin: 0;
}

@media (max-width: 640px) {
  .tenant-deleted-card {
    padding: 32px 24px;
  }

  .title {
    font-size: 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
