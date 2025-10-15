<template>
  <div class="payment-settings-page">
    <div class="container">
      <div class="settings-header">
        <h1>Configurações</h1>
        <div class="settings-nav">
          <button
            @click="$router.push('/settings')"
            :class="{ active: $route.path === '/settings' }"
            class="nav-button"
          >
            Configurações Gerais
          </button>
          <button
            @click="$router.push('/settings/payment')"
            :class="{ active: $route.path === '/settings/payment' }"
            class="nav-button"
          >
            Configurações de Pagamento
          </button>
        </div>
      </div>

      <div class="page-header">
        <h2>Configurações de Pagamento</h2>
        <p>Gerencie seus planos, faturas e métodos de pagamento</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando informações de pagamento...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Erro ao carregar dados</h3>
        <p>{{ error }}</p>
        <div class="error-details">
          <p><strong>Possíveis causas:</strong></p>
          <ul>
            <li>Você não está logado corretamente</li>
            <li>Email obrigatório não foi fornecido ou é inválido</li>
            <li>Problema de configuração no servidor</li>
            <li>Tabela de tokens não foi criada no banco de dados</li>
          </ul>
        </div>
        <button @click="loadData" class="retry-button">Tentar Novamente</button>
      </div>

      <!-- Main Content -->
      <div v-else class="content-grid">
        <!-- Resumo do Faturamento -->
        <div class="summary-card">
          <div class="card-header">
            <h2>Resumo do Faturamento</h2>
            <div class="refresh-button" @click="loadBillingSummary">
              <span>🔄</span>
            </div>
          </div>
          <div v-if="billingSummary" class="summary-content">
            <div class="summary-item">
              <span class="label">Plano Atual:</span>
              <span class="value">{{
                billingSummary.currentPlan?.name || "Nenhum"
              }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Status:</span>
              <span class="value status" :class="billingSummary.status">
                {{ getStatusText(billingSummary.status) }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">Próxima Cobrança:</span>
              <span class="value">
                {{ formatDate(billingSummary.nextPayment) || "N/A" }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">Valor Mensal:</span>
              <span class="value price">
                R$ {{ formatPrice(billingSummary.monthlyAmount) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Próximas Cobranças -->
        <div class="upcoming-card">
          <div class="card-header">
            <h2>Próximas Cobranças</h2>
          </div>
          <div v-if="upcomingCharges.length > 0" class="charges-list">
            <div
              v-for="charge in upcomingCharges"
              :key="charge.id"
              class="charge-item"
            >
              <div class="charge-info">
                <h4>{{ charge.description }}</h4>
                <p>{{ formatDate(charge.date) }}</p>
              </div>
              <div class="charge-amount">
                R$ {{ formatPrice(charge.amount) }}
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Nenhuma cobrança pendente</p>
          </div>
        </div>

        <!-- Métodos de Pagamento -->
        <div class="payment-methods-card">
          <div class="card-header">
            <h2>Métodos de Pagamento</h2>
            <button @click="addPaymentMethod" class="add-button">
              + Adicionar
            </button>
          </div>
          <div v-if="paymentMethods.length > 0" class="methods-list">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="method-item"
            >
              <div class="method-info">
                <div class="method-icon">
                  {{ getPaymentMethodIcon(method.type) }}
                </div>
                <div class="method-details">
                  <h4>{{ method.brand }} ****{{ method.last4 }}</h4>
                  <p>{{ method.exp_month }}/{{ method.exp_year }}</p>
                </div>
              </div>
              <div class="method-actions">
                <button v-if="method.is_default" class="default-badge" disabled>
                  Padrão
                </button>
                <button
                  v-else
                  @click="setAsDefault(method.id)"
                  class="set-default-button"
                >
                  Definir como Padrão
                </button>
                <button
                  @click="removePaymentMethod(method.id)"
                  class="remove-button"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Nenhum método de pagamento cadastrado</p>
          </div>
        </div>

        <!-- Faturas -->
        <div class="invoices-card">
          <div class="card-header">
            <h2>Faturas</h2>
            <div class="filters">
              <select v-model="invoiceFilter" @change="loadInvoices">
                <option value="">Todos os Status</option>
                <option value="paid">Pagas</option>
                <option value="open">Em Aberto</option>
                <option value="void">Canceladas</option>
                <option value="uncollectible">Inadimplentes</option>
              </select>
            </div>
          </div>
          <div v-if="invoices.length > 0" class="invoices-list">
            <div
              v-for="invoice in invoices"
              :key="invoice.id"
              class="invoice-item"
              @click="viewInvoiceDetails(invoice)"
            >
              <div class="invoice-info">
                <h4>#{{ invoice.number }}</h4>
                <p>{{ formatDate(invoice.created) }}</p>
              </div>
              <div class="invoice-amount">
                <span class="amount"
                  >R$ {{ formatPrice(invoice.amount_paid) }}</span
                >
                <span class="status" :class="invoice.status">
                  {{ getStatusText(invoice.status) }}
                </span>
              </div>
              <div class="invoice-actions">
                <button
                  @click.stop="downloadInvoice(invoice.id)"
                  class="download-button"
                >
                  📄
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Nenhuma fatura encontrada</p>
          </div>
        </div>

        <!-- Histórico de Pagamentos -->
        <div class="payments-card">
          <div class="card-header">
            <h2>Histórico de Pagamentos</h2>
          </div>
          <div v-if="payments.length > 0" class="payments-list">
            <div
              v-for="payment in payments"
              :key="payment.id"
              class="payment-item"
            >
              <div class="payment-info">
                <h4>{{ payment.description || "Pagamento" }}</h4>
                <p>{{ formatDate(payment.created) }}</p>
              </div>
              <div class="payment-amount">
                <span class="amount">R$ {{ formatPrice(payment.amount) }}</span>
                <span class="status" :class="payment.status">
                  {{ getStatusText(payment.status) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Nenhum pagamento encontrado</p>
          </div>
        </div>
      </div>

      <!-- Modal de Detalhes da Fatura -->
      <div
        v-if="selectedInvoice"
        class="modal-overlay"
        @click="closeInvoiceModal"
      >
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Detalhes da Fatura #{{ selectedInvoice.number }}</h3>
            <button @click="closeInvoiceModal" class="close-button">×</button>
          </div>
          <div class="modal-body">
            <div class="invoice-details">
              <div class="detail-row">
                <span class="label">Data de Criação:</span>
                <span class="value">{{
                  formatDate(selectedInvoice.created)
                }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Data de Vencimento:</span>
                <span class="value">{{
                  formatDate(selectedInvoice.due_date)
                }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value status" :class="selectedInvoice.status">
                  {{ getStatusText(selectedInvoice.status) }}
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Valor:</span>
                <span class="value price"
                  >R$ {{ formatPrice(selectedInvoice.amount_paid) }}</span
                >
              </div>
              <div class="detail-row">
                <span class="label">Descrição:</span>
                <span class="value">{{
                  selectedInvoice.description || "N/A"
                }}</span>
              </div>
            </div>
            <div class="modal-actions">
              <button
                @click="downloadInvoice(selectedInvoice.id)"
                class="download-button"
              >
                📄 Baixar PDF
              </button>
              <button @click="closeInvoiceModal" class="close-modal-button">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Head
useHead({
  titleTemplate: "Configurações de Pagamento",
});

// Composable para usuário
const { user, getUserInfo, getUserEmail } = useUser();

// Estados
const loading = ref(false);
const error = ref(null);
const billingSummary = ref(null);
const upcomingCharges = ref([]);
const paymentMethods = ref([]);
const invoices = ref([]);
const payments = ref([]);
const selectedInvoice = ref(null);
const invoiceFilter = ref("");

// API URLs
const API_BASE = "http://api.volleytrack.local/v1";

// Carregar dados iniciais
const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;

    console.log("🔍 Debug - User:", user.value);
    console.log("🔍 Debug - User Email:", getUserEmail());

    // Carregar dados de forma sequencial para melhor tratamento de erro
    await loadBillingSummary();
    await loadUpcomingCharges();
    await loadPaymentMethods();
    await loadInvoices();
    await loadPayments();
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    error.value =
      "Erro ao carregar dados de pagamento. Verifique se você está logado corretamente.";
  } finally {
    loading.value = false;
  }
};

// Carregar resumo do faturamento
const loadBillingSummary = async () => {
  try {
    const token = getAuthToken();
    const userEmail = getUserEmail();

    if (!token) {
      console.warn("Token não encontrado, pulando carregamento do resumo");
      return;
    }

    if (!userEmail) {
      console.warn(
        "Email do usuário não encontrado, pulando carregamento do resumo"
      );
      return;
    }

    const params = new URLSearchParams();
    params.append("email", userEmail);

    console.log("🔍 Debug - URL:", `${API_BASE}/billing/summary?${params}`);
    console.log("🔍 Debug - Email:", userEmail);

    const response = await fetch(`${API_BASE}/billing/summary?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("🔍 Debug - Response Status:", response.status);

    if (response.status === 401) {
      console.warn("Token expirado, redirecionando para login");
      navigateTo("/login");
      return;
    }

    if (response.status === 422) {
      console.error("Email obrigatório não fornecido ou inválido");
      throw new Error("Email obrigatório não fornecido ou inválido");
    }

    if (response.status === 500) {
      console.error(
        "Erro interno do servidor - possivelmente tabela personal_access_tokens não existe"
      );
      throw new Error(
        "Erro interno do servidor. Entre em contato com o suporte."
      );
    }

    if (!response.ok) throw new Error("Erro ao carregar resumo");

    const data = await response.json();
    console.log("🔍 Debug - Response Data:", data);
    billingSummary.value = data.data;
  } catch (err) {
    console.error("Erro ao carregar resumo:", err);
  }
};

// Carregar próximas cobranças
const loadUpcomingCharges = async () => {
  try {
    const token = getAuthToken();
    const userEmail = getUserEmail();

    if (!token) return;
    if (!userEmail) return;

    const params = new URLSearchParams();
    params.append("email", userEmail);

    console.log(
      "🔍 Debug - Upcoming Charges URL:",
      `${API_BASE}/invoices/upcoming?${params}`
    );

    const response = await fetch(`${API_BASE}/invoices/upcoming?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      navigateTo("/login");
      return;
    }

    if (response.status === 422) {
      console.error("Email obrigatório não fornecido ou inválido");
      throw new Error("Email obrigatório não fornecido ou inválido");
    }

    if (!response.ok) throw new Error("Erro ao carregar próximas cobranças");

    const data = await response.json();
    upcomingCharges.value = data.data || [];
  } catch (err) {
    console.error("Erro ao carregar próximas cobranças:", err);
  }
};

// Carregar métodos de pagamento
const loadPaymentMethods = async () => {
  try {
    const token = getAuthToken();
    const userEmail = getUserEmail();

    if (!token) return;
    if (!userEmail) return;

    const params = new URLSearchParams();
    params.append("email", userEmail);

    console.log(
      "🔍 Debug - Payment Methods URL:",
      `${API_BASE}/payment-methods?${params}`
    );

    const response = await fetch(`${API_BASE}/payment-methods?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      navigateTo("/login");
      return;
    }

    if (response.status === 422) {
      console.error("Email obrigatório não fornecido ou inválido");
      throw new Error("Email obrigatório não fornecido ou inválido");
    }

    if (!response.ok) throw new Error("Erro ao carregar métodos de pagamento");

    const data = await response.json();
    paymentMethods.value = data.data || [];
  } catch (err) {
    console.error("Erro ao carregar métodos de pagamento:", err);
  }
};

// Carregar faturas
const loadInvoices = async () => {
  try {
    const token = getAuthToken();
    const userEmail = getUserEmail();

    if (!token) return;
    if (!userEmail) return;

    const params = new URLSearchParams();
    params.append("email", userEmail);
    if (invoiceFilter.value) params.append("status", invoiceFilter.value);
    params.append("limit", "10");

    console.log("🔍 Debug - Invoices URL:", `${API_BASE}/invoices?${params}`);

    const response = await fetch(`${API_BASE}/invoices?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      navigateTo("/login");
      return;
    }

    if (response.status === 422) {
      console.error("Email obrigatório não fornecido ou inválido");
      throw new Error("Email obrigatório não fornecido ou inválido");
    }

    if (!response.ok) throw new Error("Erro ao carregar faturas");

    const data = await response.json();
    invoices.value = data.data || [];
  } catch (err) {
    console.error("Erro ao carregar faturas:", err);
  }
};

// Carregar histórico de pagamentos
const loadPayments = async () => {
  try {
    const token = getAuthToken();
    const userEmail = getUserEmail();

    if (!token) return;
    if (!userEmail) return;

    const params = new URLSearchParams();
    params.append("email", userEmail);
    params.append("limit", "10");

    console.log("🔍 Debug - Payments URL:", `${API_BASE}/payments?${params}`);

    const response = await fetch(`${API_BASE}/payments?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      navigateTo("/login");
      return;
    }

    if (response.status === 422) {
      console.error("Email obrigatório não fornecido ou inválido");
      throw new Error("Email obrigatório não fornecido ou inválido");
    }

    if (!response.ok) throw new Error("Erro ao carregar pagamentos");

    const data = await response.json();
    payments.value = data.data || [];
  } catch (err) {
    console.error("Erro ao carregar pagamentos:", err);
  }
};

// Funções auxiliares
const getAuthToken = () => {
  return localStorage.getItem("userToken") || "";
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("pt-BR");
};

const formatPrice = (amount) => {
  if (!amount) return "0,00";
  return (amount / 100).toFixed(2).replace(".", ",");
};

const getStatusText = (status) => {
  const statusMap = {
    paid: "Pago",
    open: "Em Aberto",
    void: "Cancelado",
    uncollectible: "Inadimplente",
    succeeded: "Sucesso",
    pending: "Pendente",
    failed: "Falhou",
  };
  return statusMap[status] || status;
};

const getPaymentMethodIcon = (type) => {
  const icons = {
    card: "💳",
    bank_account: "🏦",
    sepa_debit: "🇪🇺",
  };
  return icons[type] || "💳";
};

// Ações
const addPaymentMethod = () => {
  // Implementar lógica para adicionar método de pagamento
  alert("Funcionalidade em desenvolvimento");
};

const setAsDefault = async (methodId) => {
  try {
    const token = getAuthToken();
    const userEmail = getUserEmail();

    if (!token) {
      navigateTo("/login");
      return;
    }

    if (!userEmail) {
      console.error("Email do usuário não encontrado");
      return;
    }

    const params = new URLSearchParams();
    params.append("email", userEmail);

    const response = await fetch(
      `${API_BASE}/payment-methods/${methodId}/default?${params}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401) {
      navigateTo("/login");
      return;
    }

    if (response.status === 422) {
      console.error("Email obrigatório não fornecido ou inválido");
      throw new Error("Email obrigatório não fornecido ou inválido");
    }

    if (response.ok) {
      await loadPaymentMethods();
    }
  } catch (err) {
    console.error("Erro ao definir método padrão:", err);
  }
};

const removePaymentMethod = async (methodId) => {
  if (confirm("Tem certeza que deseja remover este método de pagamento?")) {
    try {
      const token = getAuthToken();
      const userEmail = getUserEmail();

      if (!token) {
        navigateTo("/login");
        return;
      }

      if (!userEmail) {
        console.error("Email do usuário não encontrado");
        return;
      }

      const params = new URLSearchParams();
      params.append("email", userEmail);

      const response = await fetch(
        `${API_BASE}/payment-methods/${methodId}?${params}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        navigateTo("/login");
        return;
      }

      if (response.status === 422) {
        console.error("Email obrigatório não fornecido ou inválido");
        throw new Error("Email obrigatório não fornecido ou inválido");
      }

      if (response.ok) {
        await loadPaymentMethods();
      }
    } catch (err) {
      console.error("Erro ao remover método de pagamento:", err);
    }
  }
};

const viewInvoiceDetails = (invoice) => {
  selectedInvoice.value = invoice;
};

const closeInvoiceModal = () => {
  selectedInvoice.value = null;
};

const downloadInvoice = async (invoiceId) => {
  try {
    const token = getAuthToken();
    const userEmail = getUserEmail();

    if (!token) {
      navigateTo("/login");
      return;
    }

    if (!userEmail) {
      console.error("Email do usuário não encontrado");
      return;
    }

    const params = new URLSearchParams();
    params.append("email", userEmail);

    const response = await fetch(
      `${API_BASE}/invoices/${invoiceId}/pdf?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      navigateTo("/login");
      return;
    }

    if (response.status === 422) {
      console.error("Email obrigatório não fornecido ou inválido");
      throw new Error("Email obrigatório não fornecido ou inválido");
    }

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fatura-${invoiceId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error("Erro ao baixar fatura:", err);
  }
};

// Verificar autenticação
const checkAuth = () => {
  const token = getAuthToken();
  if (!token) {
    console.warn("⚠️ Usuário não autenticado, redirecionando para login");
    navigateTo("/login");
    return false;
  }
  return true;
};

// Inicialização
onMounted(async () => {
  // Verificar autenticação primeiro
  if (!checkAuth()) return;

  await getUserInfo();
  await loadData();
});
</script>

<style scoped>
.payment-settings-page {
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 30px;
}

.settings-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
}

.settings-nav {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
}

.nav-button {
  background: none;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.nav-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-button.active {
  color: white;
  border-bottom-color: white;
  background: rgba(255, 255, 255, 0.1);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .settings-nav {
    flex-direction: column;
    gap: 0;
  }

  .nav-button {
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0;
  }

  .nav-button.active {
    border-bottom-color: white;
  }
}

.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 40px;
}

.error-details {
  margin: 20px 0;
  text-align: left;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-details p {
  margin: 0 0 10px 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.error-details ul {
  margin: 10px 0 0 20px;
  color: rgba(255, 255, 255, 0.8);
}

.error-details li {
  margin: 5px 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.summary-card,
.upcoming-card,
.payment-methods-card,
.invoices-card,
.payments-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.refresh-button {
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.refresh-button:hover {
  background: #f3f4f6;
}

.add-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-button:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-item .label {
  color: #6b7280;
  font-weight: 500;
}

.summary-item .value {
  font-weight: 600;
  color: #1f2937;
}

.summary-item .value.status.paid {
  color: #10b981;
}

.summary-item .value.status.open {
  color: #f59e0b;
}

.summary-item .value.status.void {
  color: #ef4444;
}

.summary-item .value.price {
  color: #667eea;
  font-size: 1.1rem;
}

.charges-list,
.methods-list,
.invoices-list,
.payments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.charge-item,
.method-item,
.invoice-item,
.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.invoice-item {
  cursor: pointer;
}

.invoice-item:hover {
  background: #f9fafb;
  border-color: #667eea;
}

.charge-info,
.method-info,
.invoice-info,
.payment-info {
  flex: 1;
}

.charge-info h4,
.method-info h4,
.invoice-info h4,
.payment-info h4 {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.charge-info p,
.method-info p,
.invoice-info p,
.payment-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.method-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-icon {
  font-size: 1.5rem;
}

.method-details h4 {
  margin: 0 0 4px 0;
}

.method-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.default-badge {
  background: #10b981;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.set-default-button,
.remove-button {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.set-default-button {
  background: #f3f4f6;
  color: #374151;
}

.set-default-button:hover {
  background: #e5e7eb;
}

.remove-button {
  background: #fef2f2;
  color: #dc2626;
}

.remove-button:hover {
  background: #fee2e2;
}

.charge-amount,
.invoice-amount,
.payment-amount {
  text-align: right;
}

.charge-amount,
.invoice-amount .amount,
.payment-amount .amount {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.1rem;
}

.status {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 4px;
}

.status.paid {
  color: #10b981;
}

.status.open {
  color: #f59e0b;
}

.status.void {
  color: #ef4444;
}

.status.succeeded {
  color: #10b981;
}

.status.pending {
  color: #f59e0b;
}

.status.failed {
  color: #ef4444;
}

.invoice-actions {
  display: flex;
  gap: 8px;
}

.download-button {
  background: #f3f4f6;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.download-button:hover {
  background: #e5e7eb;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.invoice-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-row .label {
  color: #6b7280;
  font-weight: 500;
}

.detail-row .value {
  font-weight: 600;
  color: #1f2937;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.close-modal-button {
  background: #6b7280;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.close-modal-button:hover {
  background: #4b5563;
}

/* Responsividade */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .method-actions {
    flex-direction: column;
    gap: 4px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>
