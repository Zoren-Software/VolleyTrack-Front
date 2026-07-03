<template>
  <ZListPageContainer narrow>
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
      </div>
    </div>

    <div class="section-container">
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
                      {{
                        getEventTitle(
                          item.notificationType?.key,
                          item.notificationType?.description,
                        )
                      }}
                    </p>
                    <p class="event-description">
                      {{ getEventDescription(item) }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="toggle-cell" v-if="item.notificationType?.allowEmail">
                <va-switch
                  v-model="form[item.notificationType.key].viaEmail"
                  color="#FF4E1B"
                  size="small"
                />
              </td>
              <td class="toggle-cell" v-else>
                <span class="not-available">-</span>
              </td>
              <td class="toggle-cell" v-if="item.notificationType?.allowSystem">
                <va-switch
                  v-model="form[item.notificationType.key].viaSystem"
                  color="#FF4E1B"
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

    <div class="action-buttons">
      <va-button color="secondary" class="mr-1" @click="$router.push('/')">
        Voltar
      </va-button>
      <va-button color="primary" :loading="loading" @click="salvarConfiguracoes">
        Salvar
      </va-button>
    </div>
  </ZListPageContainer>
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
    getEventTitle(key, description) {
      const titleMap = {
        training_created: "Treino criado",
        training_canceled: "Treino cancelado",
        training_updated: "Treino alterado",
        evaluation_available: "Nova avaliação disponível",
        technical_comments: "Comentários técnicos",
      };

      if (key && titleMap[key]) {
        return titleMap[key];
      }

      return description || "Evento";
    },
    getEventDescription(item) {
      const key = item?.notificationType?.key;
      const descriptionMap = {
        training_created: "Quando um treino for agendado",
        training_canceled: "Quando um treino for cancelado",
        training_updated: "Quando houver alterações em um treino",
        evaluation_available: "Quando uma nova avaliação for agendada",
        technical_comments: "Quando houver novos comentários técnicos",
      };

      if (key && descriptionMap[key]) {
        return descriptionMap[key];
      }

      // Ajuste de usabilidade: evitar "Notificação do sistema" genérico
      // para eventos claramente identificados como treino cancelado.
      const backendDescription = item?.notificationType?.description || "";
      if (
        backendDescription === "Notificação do sistema" &&
        /treino cancelado/i.test(item?.notificationType?.name || "") // name ou outro campo do backend
      ) {
        return "Quando um treino for cancelado";
      }

      return backendDescription || "Notificação do sistema";
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
          const message = error.graphQLErrors?.[0]?.message || null;
          confirmError("Erro ao salvar configurações!", message);
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
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

.section-container {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  padding: 10px 12px;
  text-align: left;
  font-size: 13px;
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
  padding: 10px 12px;
}

.event-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.event-details {
  flex: 1;
}

.event-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2px 0;
  line-height: 1.25;
}

.event-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.35;
}

.toggle-cell {
  padding: 10px 12px;
  vertical-align: middle;
}

.not-available {
  color: #9ca3af;
  font-style: italic;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 4px;
  padding-top: 0;
}

.action-buttons :deep(.va-button) {
  border-radius: 8px;
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

  .section-container {
    padding: 14px 14px;
  }

  .events-table {
    font-size: 13px;
  }

  .event-cell {
    padding: 8px 10px;
  }

  .toggle-cell {
    padding: 8px 10px;
  }

  .events-table th {
    padding: 8px 10px;
    font-size: 12px;
  }

  .event-icon-wrapper {
    width: 36px;
    height: 36px;
  }

  .event-title {
    font-size: 14px;
  }

  .event-description {
    font-size: 12px;
  }

  .action-buttons {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .action-buttons :deep(.va-button) {
    width: 100%;
    justify-content: center;
  }
}
</style>
