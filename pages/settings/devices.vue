<template>
  <ZListPageContainer>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Dispositivos</h1>
          <p class="page-subtitle">
            Gerencie os dispositivos e sessões ativas da sua conta
          </p>
        </div>
        <va-button
          color="#ef4444"
          class="revoke-all-button"
          :loading="loadingAll"
          @click="revogarTodasOutras"
        >
          <va-icon name="logout" class="button-icon" />
          <span class="button-text">Encerrar outras sessões</span>
        </va-button>
      </div>
    </div>

    <!-- Dispositivos -->
    <div class="section-container">
      <div v-if="loading" class="loading-wrapper">
        <va-progress-circle indeterminate color="#FF4E1B" />
      </div>

      <div v-else-if="devices.length === 0" class="empty-state">
        <va-icon name="devices" size="48px" color="#9ca3af" />
        <p>Nenhum dispositivo encontrado.</p>
      </div>

      <div v-else>
        <p v-if="hasLegacySessions" class="legacy-notice">
          <va-icon name="info" size="16px" color="#f59e0b" />
          Sessões anteriores à ativação do rastreamento não exibem endereço IP.
          Faça login novamente para atualizar.
        </p>
        <div class="devices-list">
          <div
            v-for="device in devices"
            :key="device.id"
            class="device-card"
            :class="{ 'device-card--current': device.id === currentDeviceId }"
          >
            <div class="device-info">
              <div class="device-icon-wrapper">
                <va-icon
                  :name="getDeviceIcon(device.deviceName)"
                  size="24px"
                  color="#FF4E1B"
                />
              </div>
              <div class="device-details">
                <div class="device-name-row">
                  <p class="device-name">
                    {{ device.deviceName || device.name }}
                  </p>
                  <span
                    v-if="device.id === currentDeviceId"
                    class="current-badge"
                  >
                    <va-icon name="check_circle" size="13px" />
                    Sessão atual
                  </span>
                </div>
                <p class="device-meta">
                  <va-icon
                    name="location_on"
                    size="14px"
                    :color="device.ipAddress ? '#9ca3af' : '#d1d5db'"
                  />
                  <span :class="device.ipAddress ? '' : 'ip-unknown'">
                    {{ device.ipAddress || "IP não registrado" }}
                  </span>
                  <template v-if="device.ipAddress">
                    &nbsp;·&nbsp;
                    <span class="device-location">
                      {{ device.location || "Cidade não identificada" }}
                    </span>
                  </template>
                  &nbsp;·&nbsp;
                  <va-icon name="schedule" size="14px" color="#9ca3af" />
                  {{ formatDate(device.createdAt) }}
                </p>
                <p v-if="device.lastUsedAt" class="device-last-used">
                  Último acesso: {{ formatDate(device.lastUsedAt) }}
                </p>
              </div>
            </div>

            <!-- Action menu (ZDataTableActions pattern) -->
            <div class="action-menu">
              <va-popover
                placement="bottom-end"
                trigger="click"
                class="action-menu-popover"
                content-class="z-device-actions-popover"
              >
                <va-button
                  preset="plain"
                  icon="more_vert"
                  size="small"
                  class="action-menu-trigger"
                  @click.stop
                />
                <template #body>
                  <div class="action-menu-panel" @click.stop>
                    <button
                      type="button"
                      class="action-menu-item"
                      @click="abrirDetalhes(device)"
                    >
                      <va-icon name="visibility" size="16px" color="#6b7280" />
                      <span>Ver detalhes</span>
                    </button>
                    <button
                      v-if="device.id !== currentDeviceId"
                      type="button"
                      class="action-menu-item action-menu-item--danger"
                      @click="revogarDispositivo(device.id)"
                    >
                      <va-icon name="delete" size="16px" color="#ef4444" />
                      <span>Revogar sessão</span>
                    </button>
                    <div
                      v-else
                      class="action-menu-item action-menu-item--disabled"
                    >
                      <va-icon name="lock" size="16px" color="#d1d5db" />
                      <span>Sessão atual (não revogável)</span>
                    </div>
                  </div>
                </template>
              </va-popover>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Voltar -->
    <div class="action-buttons">
      <va-button
        preset="secondary"
        class="back-button"
        @click="$router.push('/settings')"
      >
        <va-icon name="arrow_back" size="16px" />
        Voltar
      </va-button>
    </div>

    <!-- Modal detalhes do token -->
    <ZModal
      v-model="modalAberto"
      title="Detalhes da sessão"
      ok-text="Fechar"
      cancel-text=""
      @ok="fecharDetalhes"
    >
      <div v-if="deviceSelecionado" class="token-detail">
        <div class="token-detail-row">
          <span class="token-detail-label">Dispositivo</span>
          <span class="token-detail-value">{{
            deviceSelecionado.deviceName || deviceSelecionado.name
          }}</span>
        </div>
        <div class="token-detail-row">
          <span class="token-detail-label">Endereço IP</span>
          <span
            class="token-detail-value"
            :class="{ 'ip-unknown': !deviceSelecionado.ipAddress }"
          >
            {{ deviceSelecionado.ipAddress || "Não registrado" }}
          </span>
        </div>
        <div class="token-detail-row">
          <span class="token-detail-label">Localização</span>
          <span
            class="token-detail-value"
            :class="{ 'ip-unknown': !deviceSelecionado.location }"
          >
            {{ deviceSelecionado.location || "Cidade não identificada" }}
          </span>
        </div>
        <div class="token-detail-row">
          <span class="token-detail-label">Login em</span>
          <span class="token-detail-value">{{
            formatDate(deviceSelecionado.createdAt)
          }}</span>
        </div>
        <div class="token-detail-row">
          <span class="token-detail-label">Último acesso</span>
          <span class="token-detail-value">{{
            formatDate(deviceSelecionado.lastUsedAt) || "-"
          }}</span>
        </div>
        <div
          v-if="deviceSelecionado.userAgent"
          class="token-detail-row token-detail-row--full"
        >
          <span class="token-detail-label">User-Agent</span>
          <code class="token-detail-ua">{{ deviceSelecionado.userAgent }}</code>
        </div>
        <div
          v-if="deviceSelecionado.id === currentDeviceId"
          class="current-session-notice"
        >
          <va-icon name="check_circle" size="16px" color="#10b981" />
          Esta é a sessão ativa no momento.
        </div>
      </div>
    </ZModal>
  </ZListPageContainer>
</template>

<script>
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import MYDEVICES from "~/graphql/device/query/myDevices.graphql";
import CURRENTDEVICEID from "~/graphql/device/query/currentDeviceId.graphql";
import REVOKEDEVICE from "~/graphql/device/mutation/revokeDevice.graphql";
import REVOKEALLOTHERRDEVICES from "~/graphql/device/mutation/revokeAllOtherDevices.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  name: "DevicesPage",
  components: {
    ZModal,
  },
  data() {
    return {
      devices: [],
      currentDeviceId: null,
      loading: false,
      loadingAll: false,
      loadingRevoke: {},
      modalAberto: false,
      deviceSelecionado: null,
    };
  },
  mounted() {
    this.carregarDispositivos();
    this.carregarCurrentDeviceId();
  },
  computed: {
    hasLegacySessions() {
      return this.devices.some((d) => !d.ipAddress);
    },
  },
  methods: {
    getDeviceIcon(deviceName) {
      if (!deviceName) return "devices";
      const name = deviceName.toLowerCase();
      if (
        name.includes("mobile") ||
        name.includes("android") ||
        name.includes("iphone")
      )
        return "smartphone";
      if (name.includes("tablet") || name.includes("ipad")) return "tablet";
      return "computer";
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      });
    },
    abrirDetalhes(device) {
      this.deviceSelecionado = device;
      this.modalAberto = true;
    },
    fecharDetalhes() {
      this.modalAberto = false;
      this.deviceSelecionado = null;
    },
    carregarCurrentDeviceId() {
      const query = gql`
        ${CURRENTDEVICEID}
      `;
      const { onResult } = useQuery(query, {}, { fetchPolicy: "network-only" });
      onResult((result) => {
        this.currentDeviceId = result?.data?.currentDeviceId ?? null;
      });
    },
    carregarDispositivos() {
      this.loading = true;
      const query = gql`
        ${MYDEVICES}
      `;
      const { onResult, onError } = useQuery(
        query,
        {},
        { fetchPolicy: "network-only" },
      );

      onResult((result) => {
        this.devices = result?.data?.myDevices || [];
        this.loading = false;
      });
      onError(() => {
        this.loading = false;
        confirmError("Erro ao carregar dispositivos.");
      });
    },
    async revogarDispositivo(id) {
      try {
        this.loadingRevoke[id] = true;
        const mutation = gql`
          ${REVOKEDEVICE}
        `;
        const variables = { id };
        const { mutate } = await useMutation(mutation, { variables });
        await mutate();
        this.devices = this.devices.filter((d) => d.id !== id);
        confirmSuccess("Sessão revogada com sucesso!");
      } catch (error) {
        const message = error.graphQLErrors?.[0]?.message || null;
        confirmError("Erro ao revogar sessão.", message);
      } finally {
        this.loadingRevoke[id] = false;
      }
    },
    async revogarTodasOutras() {
      try {
        this.loadingAll = true;
        const mutation = gql`
          ${REVOKEALLOTHERRDEVICES}
        `;
        const { mutate } = await useMutation(mutation);
        await mutate();
        confirmSuccess("Outras sessões encerradas com sucesso!");
        this.carregarDispositivos();
      } catch (error) {
        const message = error.graphQLErrors?.[0]?.message || null;
        confirmError("Erro ao encerrar sessões.", message);
      } finally {
        this.loadingAll = false;
      }
    },
  },
};
</script>

<style scoped>
.page-header {
  margin-bottom: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
}

.section-container {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #9ca3af;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  gap: 12px;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.device-icon-wrapper {
  width: 48px;
  height: 48px;
  background: #fff5f2;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-name {
  font-size: 15px;
  font-weight: 600;
  color: #0b1e3a;
  margin: 0;
}

.device-meta {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ip-unknown {
  color: #d1d5db;
  font-style: italic;
}

.device-location {
  color: #6b7280;
  font-style: italic;
}

.legacy-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.device-last-used {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.device-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-card--current {
  border-color: #ff4e1b40;
  background: #fff8f5;
}

.current-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  color: #ff4e1b;
  background: #fff0ea;
  border: 1px solid #ff4e1b30;
  border-radius: 9999px;
  padding: 2px 8px;
}

/* ─── Action menu (matches ZDataTableActions) ─── */
.action-menu {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.action-menu-trigger {
  min-width: 36px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  padding: 0;
  color: #71717a !important;
  background-color: #f4f4f5 !important;
  border: 1px solid #e4e4e7 !important;
  box-shadow: none !important;
}

.action-menu-trigger:hover {
  background-color: #e9e9ec !important;
  border-color: #d4d4d8 !important;
  color: #52525b !important;
}

.action-menu-trigger :deep(.va-icon) {
  color: #71717a !important;
  font-size: 20px !important;
}

.action-menu-panel {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.action-menu-item {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  color: #111827;
  cursor: pointer;
  text-align: left;
}

.action-menu-item:hover {
  background: #f3f4f6;
}

.action-menu-item span {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}

.action-menu-item--danger span {
  color: #ef4444;
}

.action-menu-item--disabled {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  cursor: not-allowed;
  opacity: 0.5;
}

.action-menu-item--disabled span {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
}

/* ─── Token detail modal ─── */
.token-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.token-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.token-detail-row--full {
  flex-direction: column;
  gap: 6px;
}

.token-detail-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  min-width: 120px;
}

.token-detail-value {
  font-size: 14px;
  color: #111827;
}

.token-detail-ua {
  font-size: 12px;
  font-family: "Fira Code", monospace;
  background: #f3f4f6;
  padding: 8px 12px;
  border-radius: 6px;
  color: #374151;
  word-break: break-all;
  line-height: 1.6;
}

.current-session-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 8px;
}
</style>

<style>
.z-device-actions-popover {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.z-device-actions-popover .va-popover__content {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  color: inherit !important;
}
</style>
