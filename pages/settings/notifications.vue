<template>
  <div class="list-page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Preferências de Notificação</h1>
          <p class="page-subtitle">
            Escolha como deseja receber notificações para cada tipo de evento do
            sistema
          </p>
        </div>
        <va-button
          color="#E9742B"
          class="notifications-button"
          @click="goToNotifications"
        >
          <va-icon name="notifications" class="button-icon" />
          <span class="button-text">Ver Notificações</span>
        </va-button>
      </div>
    </div>

    <!-- Eventos Notificáveis -->
    <div class="section-container">
      <div class="section-header">
        <va-icon name="settings" class="section-icon" />
        <h2 class="section-title">Eventos Notificáveis</h2>
      </div>

      <div class="events-table-container">
        <table class="events-table">
          <thead>
            <tr>
              <th class="event-column">Evento</th>
              <th class="toggle-column">E-mail</th>
              <th class="toggle-column">Sistema</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data" :key="item.id" class="event-row">
              <td class="event-cell">
                <div class="event-info">
                  <div
                    class="event-icon-wrapper"
                    :style="{
                      backgroundColor:
                        getNotificationColor(item.notificationType?.key) + '20',
                    }"
                  >
                    <va-icon
                      :name="getNotificationIcon(item.notificationType?.key)"
                      :color="getNotificationColor(item.notificationType?.key)"
                      size="20px"
                    />
                  </div>
                  <div class="event-details">
                    <p class="event-title">
                      {{ item.notificationType?.description || "Evento" }}
                    </p>
                    <p class="event-description">
                      {{ getEventDescription(item.notificationType?.key) }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="toggle-cell" v-if="item.notificationType?.allowEmail">
                <va-switch
                  v-model="form[item.notificationType.key].viaEmail"
                  color="#3b82f6"
                  size="small"
                />
              </td>
              <td class="toggle-cell" v-else>
                <span class="not-available">-</span>
              </td>
              <td class="toggle-cell" v-if="item.notificationType?.allowSystem">
                <va-switch
                  v-model="form[item.notificationType.key].viaSystem"
                  color="#e9742b"
                  size="small"
                />
              </td>
              <td class="toggle-cell" v-else>
                <span class="not-available">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <va-button
        preset="secondary"
        class="back-button"
        @click="$router.push('/settings')"
      >
        <va-icon name="arrow_back" size="16px" />
        Voltar
      </va-button>
      <va-button
        color="#e9742b"
        class="save-button"
        @click="salvarConfiguracoes"
        :loading="loading"
      >
        <va-icon name="save" size="16px" />
        Salvar
      </va-button>
    </div>
  </div>
</template>

<script>
import NOTIFICATIONSETTINGS from "~/graphql/notification-settings/query/notificationSettings.graphql";
import NOTIFICATIONSETTINGSEDIT from "~/graphql/notification-settings/mutation/notificationSettingEdit.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  name: "NotificationSettingsPage",
  data() {
    return {
      data: [],
      form: {},
      loading: false,
    };
  },
  mounted() {
    this.getNotificationSettings();
  },
  methods: {
    goToNotifications() {
      this.$router.push("/notifications");
    },
    getNotificationIcon(key) {
      const iconMap = {
        training_created: "check_circle",
        training_canceled: "cancel",
        training_updated: "edit",
        evaluation_available: "description",
        technical_comments: "comment",
      };
      return iconMap[key] || "notifications";
    },
    getNotificationColor(key) {
      const colorMap = {
        training_created: "#10b981",
        training_canceled: "#ef4444",
        training_updated: "#f59e0b",
        evaluation_available: "#10b981",
        technical_comments: "#8b5cf6",
      };
      return colorMap[key] || "#6b7280";
    },
    getEventDescription(key) {
      const descriptionMap = {
        training_created: "Quando um novo treino for agendado",
        training_canceled: "Quando um treino for cancelado",
        training_updated: "Quando houver alterações em um treino",
        evaluation_available: "Quando uma nova avaliação for agendada",
        technical_comments: "Quando houver novos comentários técnicos",
      };
      return descriptionMap[key] || "Notificação do sistema";
    },
    getNotificationSettings() {
      const query = gql`
        ${NOTIFICATIONSETTINGS}
      `;

      const consult = {};
      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        const settings = result?.data?.notificationsSettings?.data;
        if (Array.isArray(settings)) {
          this.data = settings;

          this.form = {};
          settings.forEach((item) => {
            const key = item.notificationType?.key;
            if (key) {
              this.form[key] = {
                viaEmail: item.viaEmail || false,
                viaSystem: item.viaSystem || false,
              };
            }
          });
        } else {
          console.warn("notificationsSettings não é um array:", settings);
          this.data = [];
        }
      });
    },

    async salvarConfiguracoes() {
      try {
        this.loading = true;
        this.errorFields = [];
        this.errors = {};

        const mutation = gql`
          ${NOTIFICATIONSETTINGSEDIT}
        `;

        const promises = this.data.map((item) => {
          const key = item.notificationType?.key;
          if (!key || !this.form[key]) {
            return Promise.resolve();
          }

          const variables = {
            id: parseInt(item.id, 10),
            notificationTypeId: parseInt(item.notificationType?.id, 10),
            viaEmail: this.form[key].viaEmail || false,
            viaSystem: this.form[key].viaSystem || false,
          };

          const { mutate } = useMutation(mutation, { variables });
          return mutate();
        });

        await Promise.all(promises);

        confirmSuccess("Configurações salvas com sucesso!");
      } catch (error) {
        console.error(error);
        this.error = true;

        if (
          error.graphQLErrors &&
          error.graphQLErrors[0]?.extensions?.validation
        ) {
          this.errors = error.graphQLErrors[0].extensions.validation;
          this.errorFields = Object.keys(this.errors);

          const footer = Object.values(this.errors)
            .map((v) => v[0])
            .join("<br>");

          confirmError("Erro ao salvar configurações!", footer);
        } else {
          confirmError("Erro ao salvar configurações!");
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.list-page-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 32px;
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
  line-height: 1.5;
}

.notifications-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #e9742b !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(233, 116, 43, 0.3);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.notifications-button:hover {
  background-color: #d6652a !important;
  box-shadow: 0 4px 12px rgba(233, 116, 43, 0.4);
  transform: translateY(-1px);
}

.notifications-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(233, 116, 43, 0.3);
}

.notifications-button .button-icon {
  font-size: 20px;
  color: #ffffff;
}

.notifications-button .button-text {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: 0.3px;
}

/* Section */
.section-container {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.section-icon {
  color: #e9742b;
  font-size: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* Events Table */
.events-table-container {
  overflow-x: auto;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
}

.events-table thead {
  background: #f9fafb;
}

.events-table th {
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
}

.event-column {
  width: 50%;
}

.toggle-column {
  width: 25%;
  text-align: center;
}

.event-row {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

.event-row:hover {
  background-color: #f9fafb;
}

.event-cell {
  padding: 20px 16px;
}

.event-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.event-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.event-details {
  flex: 1;
}

.event-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.event-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.toggle-cell {
  padding: 20px 16px;
  text-align: center;
  vertical-align: middle;
}

.not-available {
  color: #9ca3af;
  font-style: italic;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  color: #6b7280;
  background: white;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.save-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(233, 116, 43, 0.2);
  transition: all 0.2s ease;
}

.save-button:hover {
  box-shadow: 0 4px 8px rgba(233, 116, 43, 0.3);
  transform: translateY(-1px);
}

/* Responsividade */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .notifications-button {
    width: 100%;
  }

  .section-container {
    padding: 20px;
  }

  .section-title {
    font-size: 18px;
  }

  .events-table {
    font-size: 14px;
  }

  .event-cell {
    padding: 16px 12px;
  }

  .event-icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .event-title {
    font-size: 14px;
  }

  .event-description {
    font-size: 12px;
  }

  .action-buttons {
    flex-direction: column-reverse;
  }

  .back-button,
  .save-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
