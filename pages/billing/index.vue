<template>
  <div class="billing-page">
    <div class="list-page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div>
            <h1 class="page-title">Faturamentos</h1>
            <p class="page-subtitle">Visualize todas as suas faturas pagas</p>
          </div>
          <NuxtLink to="/payment" class="back-link-modern">
            <span class="back-icon">←</span>
            <span>Voltar para Pagamentos</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando faturas...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Erro ao carregar faturas</h3>
        <p>{{ error }}</p>
        <button class="retry-button" @click="loadInvoices">
          Tentar Novamente
        </button>
      </div>

      <!-- Invoices List -->
      <div
        v-else-if="
          !loading &&
          (lifetimePayments.length > 0 || subscriptionInvoices.length > 0)
        "
        class="billing-listing"
      >
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card-modern">
            <div class="summary-icon">
              <va-icon name="receipt" size="32px" color="#3b82f6" />
            </div>
            <div class="summary-content">
              <span class="summary-label">Total de Faturas</span>
              <span class="summary-value">{{ summary.total_invoices }}</span>
            </div>
          </div>
          <div class="summary-card-modern">
            <div class="summary-icon">
              <va-icon name="attach_money" size="32px" color="#10b981" />
            </div>
            <div class="summary-content">
              <span class="summary-label">Valor Total</span>
              <span class="summary-value"
                >R$ {{ formatCurrency(summary.total_amount) }}</span
              >
            </div>
          </div>
        </div>

        <!-- Planos Vitalícios -->
        <div
          v-if="lifetimePayments.length > 0"
          class="section-container-modern"
        >
          <div class="section-header-modern">
            <h2 class="section-title-modern">
              <va-icon name="diamond" size="24px" color="#2563eb" />
              <span>Planos Vitalícios</span>
            </h2>
            <span class="section-count-modern"
              >{{ lifetimePayments.length }} pagamento(s)</span
            >
          </div>

          <div class="invoices-list">
            <div
              v-for="payment in lifetimePayments"
              :key="payment.id"
              class="invoice-card lifetime-card"
            >
              <div class="invoice-header">
                <div class="invoice-info">
                  <h3 class="invoice-number">
                    {{ payment.number || payment.id }}
                  </h3>
                  <span class="invoice-status status-paid">
                    Plano Vitalício
                  </span>
                </div>
                <div class="invoice-amount">
                  <span class="amount-value"
                    >R$ {{ formatCurrency(payment.amount_paid) }}</span
                  >
                  <span class="amount-currency">{{
                    payment.currency.toUpperCase()
                  }}</span>
                </div>
              </div>

              <div class="invoice-details">
                <div class="detail-item">
                  <span class="detail-label">Data de Pagamento:</span>
                  <span class="detail-value">{{
                    formatDate(payment.paid_at)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Data de Criação:</span>
                  <span class="detail-value">{{
                    formatDate(payment.created)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Tipo:</span>
                  <span class="detail-value">Pagamento Único</span>
                </div>
              </div>

              <!-- Payment Lines -->
              <div
                v-if="payment.lines && payment.lines.length > 0"
                class="invoice-lines"
              >
                <h4 class="lines-title">Itens do Pagamento</h4>
                <div
                  v-for="(line, index) in payment.lines"
                  :key="line.id || index"
                  class="invoice-line"
                >
                  <div class="line-info">
                    <span class="line-description">{{
                      line.description || "Item sem descrição"
                    }}</span>
                    <span class="line-quantity"
                      >Qtd: {{ line.quantity || 1 }}</span
                    >
                  </div>
                  <div class="line-amount">
                    <span>R$ {{ formatCurrency(line.amount) }}</span>
                    <span v-if="line.product" class="line-product">{{
                      line.product.name
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Actions -->
              <div class="invoice-actions">
                <span class="action-note">
                  <va-icon name="diamond" size="16px" color="#2563eb" />
                  Pagamento único - Acesso vitalício
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Assinaturas -->
        <div
          v-if="subscriptionInvoices.length > 0"
          class="section-container-modern"
        >
          <div class="section-header-modern">
            <h2 class="section-title-modern">
              <va-icon name="refresh" size="24px" color="#3b82f6" />
              <span>Assinaturas</span>
            </h2>
            <span class="section-count-modern"
              >{{ subscriptionInvoices.length }} fatura(s)</span
            >
          </div>

          <div class="invoices-list">
            <div
              v-for="invoice in subscriptionInvoices"
              :key="invoice.id"
              class="invoice-card subscription-card"
            >
              <div class="invoice-header">
                <div class="invoice-info">
                  <h3 class="invoice-number">
                    {{ invoice.number || invoice.id }}
                  </h3>
                  <span
                    class="invoice-status"
                    :class="`status-${invoice.status}`"
                  >
                    {{ getStatusLabel(invoice.status) }}
                  </span>
                </div>
                <div class="invoice-amount">
                  <span class="amount-value"
                    >R$ {{ formatCurrency(invoice.amount_paid) }}</span
                  >
                  <span class="amount-currency">{{
                    invoice.currency.toUpperCase()
                  }}</span>
                </div>
              </div>

              <div class="invoice-details">
                <div class="detail-item">
                  <span class="detail-label">Data de Pagamento:</span>
                  <span class="detail-value">{{
                    formatDate(invoice.paid_at)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Data de Criação:</span>
                  <span class="detail-value">{{
                    formatDate(invoice.created)
                  }}</span>
                </div>
                <div
                  v-if="invoice.period_start && invoice.period_end"
                  class="detail-item"
                >
                  <span class="detail-label">Período:</span>
                  <span class="detail-value">
                    {{ formatDate(invoice.period_start) }} -
                    {{ formatDate(invoice.period_end) }}
                  </span>
                </div>
              </div>

              <!-- Invoice Lines -->
              <div
                v-if="invoice.lines && invoice.lines.length > 0"
                class="invoice-lines"
              >
                <h4 class="lines-title">Itens da Fatura</h4>
                <div
                  v-for="(line, index) in invoice.lines"
                  :key="line.id || index"
                  class="invoice-line"
                >
                  <div class="line-info">
                    <span class="line-description">{{
                      line.description || "Item sem descrição"
                    }}</span>
                    <span class="line-quantity"
                      >Qtd: {{ line.quantity || 1 }}</span
                    >
                  </div>
                  <div class="line-amount">
                    <span>R$ {{ formatCurrency(line.amount) }}</span>
                    <span v-if="line.product" class="line-product">{{
                      line.product.name
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Invoice Actions -->
              <div class="invoice-actions">
                <a
                  v-if="invoice.hosted_invoice_url"
                  :href="invoice.hosted_invoice_url"
                  target="_blank"
                  class="action-button view-button"
                >
                  <span>Ver Fatura</span>
                </a>
                <a
                  v-if="invoice.invoice_pdf"
                  :href="invoice.invoice_pdf"
                  target="_blank"
                  class="action-button download-button"
                >
                  <span>Baixar PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total_pages > 1" class="pagination-container">
          <button
            class="pagination-button"
            :disabled="pagination.current_page === 1 || loading"
            @click="goToPage(pagination.current_page - 1)"
          >
            Anterior
          </button>

          <div class="pagination-info">
            <span
              >Página {{ pagination.current_page }} de
              {{ pagination.total_pages }}</span
            >
            <span class="pagination-total"
              >({{ pagination.total }} faturas)</span
            >
          </div>

          <button
            class="pagination-button"
            :disabled="!pagination.has_more || loading"
            @click="goToPage(pagination.current_page + 1)"
          >
            Próxima
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>Nenhuma fatura encontrada</h3>
        <p>Você ainda não possui faturas pagas ou planos vitalícios.</p>
        <NuxtLink to="/payment" class="back-link">
          <span>Ver Planos de Assinatura</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useUser } from "~/composables/useUser";

const runtimeConfig = useRuntimeConfig();
const { getUserEmail } = useUser();

// Estado
const loading = ref(false);
const error = ref(null);
const invoices = ref([]); // Mantido para compatibilidade
const lifetimePayments = ref([]); // Planos vitalícios
const subscriptionInvoices = ref([]); // Assinaturas
const pagination = ref({
  current_page: 1,
  total_pages: 1,
  per_page: 20,
  total: 0,
  has_more: false,
});
const summary = ref({
  total_amount: 0,
  total_invoices: 0,
  currency: "brl",
  subscription_invoices_count: 0,
  subscription_total_amount: 0,
  lifetime_payments_count: 0,
  lifetime_total_amount: 0,
});

// Função para obter tenant_id
const getTenantId = () => {
  if (process.client) {
    const storedTenant = localStorage.getItem("tenant_id");
    if (storedTenant) {
      return storedTenant;
    }
    return "test";
  }
  return "test";
};

// Função para formatar moeda
const formatCurrency = (amount) => {
  if (!amount) return "0,00";
  const value = amount / 100;
  return value.toFixed(2).replace(".", ",");
};

// Função para formatar data
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Função para obter label do status
const getStatusLabel = (status) => {
  const labels = {
    paid: "Pago",
    open: "Aberto",
    void: "Cancelado",
    uncollectible: "Inadimplente",
  };
  return labels[status] || status;
};

// Função para carregar faturas
const loadInvoices = async (lifetimePage = 1, subscriptionPage = 1) => {
  try {
    loading.value = true;
    error.value = null;

    const token = localStorage.getItem("userToken");
    const apolloToken = localStorage.getItem("apollo:default.token");
    const authToken = token || apolloToken;

    if (!authToken) {
      throw new Error("Token de autenticação não encontrado");
    }

    const tenantId = getTenantId();
    const apiBaseUrl =
      runtimeConfig.public.apiEndpoint || "http://api.volleytrack.local";

    // Chamar as duas rotas separadamente
    const [lifetimeResponse, subscriptionResponse] = await Promise.all([
      // Rota para pagamentos únicos (vitalícios)
      fetch(
        `${apiBaseUrl}/v1/payments/tenant/lifetime?tenant_id=${tenantId}&limit=20&page=${lifetimePage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      ),
      // Rota para faturas de assinaturas
      fetch(
        `${apiBaseUrl}/v1/invoices/tenant/subscriptions?tenant_id=${tenantId}&limit=20&page=${subscriptionPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      ),
    ]);

    // Processar resposta de pagamentos vitalícios
    if (!lifetimeResponse.ok) {
      const errorData = await lifetimeResponse.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Erro HTTP: ${lifetimeResponse.status}`
      );
    }

    const lifetimeData = await lifetimeResponse.json();
    if (lifetimeData.success && lifetimeData.data) {
      lifetimePayments.value = lifetimeData.data.lifetime_payments || [];
      console.log("💎 Pagamentos vitalícios carregados:", {
        count: lifetimePayments.value.length,
        summary: lifetimeData.data.summary,
      });
    }

    // Processar resposta de assinaturas
    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Erro HTTP: ${subscriptionResponse.status}`
      );
    }

    const subscriptionData = await subscriptionResponse.json();
    if (subscriptionData.success && subscriptionData.data) {
      subscriptionInvoices.value =
        subscriptionData.data.subscription_invoices || [];
      console.log("🔄 Faturas de assinaturas carregadas:", {
        count: subscriptionInvoices.value.length,
        summary: subscriptionData.data.summary,
      });
    }

    // Atualizar resumo combinado
    const lifetimeSummary = lifetimeData.data?.summary || {
      total_amount: 0,
      total_payments: 0,
    };
    const subscriptionSummary = subscriptionData.data?.summary || {
      total_amount: 0,
      total_invoices: 0,
    };

    summary.value = {
      total_amount:
        lifetimeSummary.total_amount + subscriptionSummary.total_amount,
      total_invoices:
        lifetimeSummary.total_payments + subscriptionSummary.total_invoices,
      currency: "brl",
      subscription_invoices_count: subscriptionSummary.total_invoices,
      subscription_total_amount: subscriptionSummary.total_amount,
      lifetime_payments_count: lifetimeSummary.total_payments,
      lifetime_total_amount: lifetimeSummary.total_amount,
    };

    // Atualizar paginação (usar a paginação das assinaturas como referência principal)
    pagination.value = subscriptionData.data?.pagination || {
      current_page: subscriptionPage,
      total_pages: 1,
      per_page: 20,
      total: subscriptionSummary.total_invoices,
      has_more: false,
    };

    console.log("📊 Faturamentos carregados:", {
      lifetimePayments: lifetimePayments.value.length,
      subscriptionInvoices: subscriptionInvoices.value.length,
      summary: summary.value,
    });
  } catch (err) {
    console.error("Erro ao carregar faturas:", err);
    error.value = err.message || "Erro ao carregar faturas";
    lifetimePayments.value = [];
    subscriptionInvoices.value = [];
  } finally {
    loading.value = false;
  }
};

// Função para navegar para página
const goToPage = (page) => {
  // Por enquanto, carregar a mesma página para ambas as listas
  // Futuramente pode ser implementada paginação separada
  if (page >= 1) {
    loadInvoices(page, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

// Carregar faturas ao montar o componente
onMounted(() => {
  loadInvoices(1, 1);
});
</script>

<style scoped>
.billing-page {
  min-height: 100vh;
}

.list-page-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.back-link-modern {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #374151;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #e5e7eb;
}

.back-link-modern:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.back-icon {
  font-size: 1.2rem;
  font-weight: 700;
}

/* Loading, Error, Empty States */
.loading-container,
.error-container,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  color: #6b7280;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
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
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-container h3 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 1.5rem;
}

.error-container p {
  margin: 0 0 20px 0;
  color: #6b7280;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

/* Summary Cards */
.billing-listing {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.summary-card-modern {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.summary-card-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.summary-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.summary-label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.summary-value {
  color: #1f2937;
  font-size: 1.75rem;
  font-weight: 700;
}

/* Section Container */
.section-container-modern {
  margin-bottom: 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}

.section-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
}

.section-count-modern {
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 500;
}

.invoices-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 0;
}

.invoice-card {
  background: white;
  border-radius: 12px;
  padding: 24px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.invoice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.invoice-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.invoice-number {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
}

.invoice-status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
}

.status-paid {
  background: #d1fae5;
  color: #065f46;
}

.status-open {
  background: #fef3c7;
  color: #92400e;
}

.status-void {
  background: #fee2e2;
  color: #991b1b;
}

.status-uncollectible {
  background: #fee2e2;
  color: #991b1b;
}

.invoice-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.amount-value {
  color: #10b981;
  font-size: 1.75rem;
  font-weight: 700;
}

.amount-currency {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.invoice-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.detail-value {
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 600;
}

.invoice-lines {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.lines-title {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}

.invoice-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
}

.line-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.line-description {
  color: #1f2937;
  font-weight: 500;
  font-size: 0.95rem;
}

.line-quantity {
  color: #6b7280;
  font-size: 0.875rem;
}

.line-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.line-amount span:first-child {
  color: #10b981;
  font-weight: 700;
  font-size: 1rem;
}

.line-product {
  color: #6b7280;
  font-size: 0.875rem;
}

.invoice-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.action-note {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  font-style: italic;
}

.action-button {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.view-button {
  background: #3b82f6;
  color: white;
}

.view-button:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.download-button {
  background: #10b981;
  color: white;
}

.download-button:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}

.pagination-button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.pagination-button:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #1f2937;
  font-weight: 600;
  font-size: 0.95rem;
}

.pagination-total {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 400;
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 60px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  max-width: 1200px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
}

.empty-state p {
  margin: 0 0 30px 0;
  color: #6b7280;
  font-size: 1rem;
}

.empty-state .back-link-modern {
  display: inline-flex;
}

.lifetime-card {
  border-left: 4px solid #10b981;
}

.subscription-card {
  border-left: 4px solid #3b82f6;
}

/* Responsividade */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .invoice-header {
    flex-direction: column;
    gap: 15px;
  }

  .invoice-amount {
    align-items: flex-start;
  }

  .invoice-details {
    grid-template-columns: 1fr;
  }

  .invoice-actions {
    flex-direction: column;
  }

  .pagination-container {
    flex-direction: column;
    gap: 15px;
  }

  .pagination-info {
    order: -1;
  }

  .section-header-modern {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
