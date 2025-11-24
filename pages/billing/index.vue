<template>
  <div class="billing-page">
    <div class="container">
      <div class="page-header">
        <div class="header-content">
          <h1>Faturamentos</h1>
          <p>Visualize todas as suas faturas pagas</p>
        </div>
        <div class="header-actions">
          <NuxtLink to="/payment" class="back-link">
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
        <button class="retry-button" @click="loadInvoices">Tentar Novamente</button>
      </div>

      <!-- Invoices List -->
      <div v-else-if="!loading && invoices.length > 0" class="invoices-container">
        <!-- Summary -->
        <div class="summary-card">
          <div class="summary-item">
            <span class="summary-label">Total de Faturas</span>
            <span class="summary-value">{{ summary.total_invoices }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Valor Total</span>
            <span class="summary-value">R$ {{ formatCurrency(summary.total_amount) }}</span>
          </div>
        </div>

        <!-- Invoices List -->
        <div class="invoices-list">
          <div
            v-for="invoice in invoices"
            :key="invoice.id"
            class="invoice-card"
          >
            <div class="invoice-header">
              <div class="invoice-info">
                <h3 class="invoice-number">{{ invoice.number || invoice.id }}</h3>
                <span class="invoice-status" :class="`status-${invoice.status}`">
                  {{ getStatusLabel(invoice.status) }}
                </span>
              </div>
              <div class="invoice-amount">
                <span class="amount-value">R$ {{ formatCurrency(invoice.amount_paid) }}</span>
                <span class="amount-currency">{{ invoice.currency.toUpperCase() }}</span>
              </div>
            </div>

            <div class="invoice-details">
              <div class="detail-item">
                <span class="detail-label">Data de Pagamento:</span>
                <span class="detail-value">{{ formatDate(invoice.paid_at) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Data de Criação:</span>
                <span class="detail-value">{{ formatDate(invoice.created) }}</span>
              </div>
              <div v-if="invoice.period_start && invoice.period_end" class="detail-item">
                <span class="detail-label">Período:</span>
                <span class="detail-value">
                  {{ formatDate(invoice.period_start) }} - {{ formatDate(invoice.period_end) }}
                </span>
              </div>
            </div>

            <!-- Invoice Lines -->
            <div v-if="invoice.lines && invoice.lines.length > 0" class="invoice-lines">
              <h4 class="lines-title">Itens da Fatura</h4>
              <div
                v-for="(line, index) in invoice.lines"
                :key="line.id || index"
                class="invoice-line"
              >
                <div class="line-info">
                  <span class="line-description">{{ line.description || 'Item sem descrição' }}</span>
                  <span class="line-quantity">Qtd: {{ line.quantity || 1 }}</span>
                </div>
                <div class="line-amount">
                  <span>R$ {{ formatCurrency(line.amount) }}</span>
                  <span v-if="line.product" class="line-product">{{ line.product.name }}</span>
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
            <span>Página {{ pagination.current_page }} de {{ pagination.total_pages }}</span>
            <span class="pagination-total">({{ pagination.total }} faturas)</span>
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
        <p>Você ainda não possui faturas pagas.</p>
        <NuxtLink to="/payment" class="back-link">
          <span>Ver Planos de Assinatura</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUser } from '~/composables/useUser'

const runtimeConfig = useRuntimeConfig()
const { getUserEmail } = useUser()

// Estado
const loading = ref(false)
const error = ref(null)
const invoices = ref([])
const pagination = ref({
  current_page: 1,
  total_pages: 1,
  per_page: 20,
  total: 0,
  has_more: false,
})
const summary = ref({
  total_amount: 0,
  total_invoices: 0,
  currency: 'brl',
})

// Função para obter tenant_id
const getTenantId = () => {
  if (process.client) {
    const storedTenant = localStorage.getItem('tenant_id')
    if (storedTenant) {
      return storedTenant
    }
    return 'test'
  }
  return 'test'
}

// Função para formatar moeda
const formatCurrency = (amount) => {
  if (!amount) return '0,00'
  const value = amount / 100
  return value.toFixed(2).replace('.', ',')
}

// Função para formatar data
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Função para obter label do status
const getStatusLabel = (status) => {
  const labels = {
    paid: 'Pago',
    open: 'Aberto',
    void: 'Cancelado',
    uncollectible: 'Inadimplente',
  }
  return labels[status] || status
}

// Função para carregar faturas
const loadInvoices = async (page = 1) => {
  try {
    loading.value = true
    error.value = null

    const token = localStorage.getItem('userToken')
    const apolloToken = localStorage.getItem('apollo:default.token')
    const authToken = token || apolloToken

    if (!authToken) {
      throw new Error('Token de autenticação não encontrado')
    }

    const tenantId = getTenantId()
    const apiBaseUrl = runtimeConfig.public.apiEndpoint || 'http://api.volleytrack.local'
    const url = `${apiBaseUrl}/v1/invoices/tenant/paid?tenant_id=${tenantId}&limit=20&page=${page}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Erro HTTP: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.data) {
      invoices.value = data.data.invoices || []
      pagination.value = data.data.pagination || pagination.value
      summary.value = data.data.summary || summary.value
    } else {
      throw new Error('Resposta inválida da API')
    }
  } catch (err) {
    console.error('Erro ao carregar faturas:', err)
    error.value = err.message || 'Erro ao carregar faturas'
    invoices.value = []
  } finally {
    loading.value = false
  }
}

// Função para navegar para página
const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.total_pages) {
    loadInvoices(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Carregar faturas ao montar o componente
onMounted(() => {
  loadInvoices(1)
})
</script>

<style scoped>
.billing-page {
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content h1 {
  color: white;
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header-content p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.billing-link,
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.billing-link:hover,
.back-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.billing-icon,
.back-icon {
  font-size: 1.2rem;
}

.loading-container,
.error-container,
.empty-state {
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
  margin: 40px 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-container h3 {
  margin: 0 0 10px 0;
  color: white;
}

.error-container p {
  margin: 0 0 20px 0;
  color: rgba(255, 255, 255, 0.9);
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

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.summary-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.summary-value {
  color: #667eea;
  font-size: 2rem;
  font-weight: 700;
}

.invoices-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.invoice-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.invoice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.invoice-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.invoice-number {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 700;
}

.invoice-status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
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
  gap: 5px;
}

.amount-value {
  color: #667eea;
  font-size: 2rem;
  font-weight: 700;
}

.amount-currency {
  color: #666;
  font-size: 0.9rem;
}

.invoice-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-label {
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
}

.detail-value {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
}

.invoice-lines {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.lines-title {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.invoice-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.line-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.line-description {
  color: #333;
  font-weight: 500;
}

.line-quantity {
  color: #666;
  font-size: 0.85rem;
}

.line-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.line-amount span:first-child {
  color: #667eea;
  font-weight: 700;
  font-size: 1.1rem;
}

.line-product {
  color: #666;
  font-size: 0.85rem;
}

.invoice-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-button {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.view-button {
  background: #667eea;
  color: white;
}

.view-button:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.download-button {
  background: #10b981;
  color: white;
}

.download-button:hover {
  background: #059669;
  transform: translateY(-2px);
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.pagination-button {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
}

.pagination-button:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: #333;
  font-weight: 600;
}

.pagination-total {
  color: #666;
  font-size: 0.9rem;
  font-weight: 400;
}

.empty-state {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 60px 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: white;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 30px 0;
  color: rgba(255, 255, 255, 0.9);
}

.empty-state .back-link {
  display: inline-flex;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-card {
    flex-direction: column;
    gap: 20px;
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
}
</style>

