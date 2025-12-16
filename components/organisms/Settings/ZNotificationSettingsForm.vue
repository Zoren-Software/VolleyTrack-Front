<template>
  <ZFormModal
    v-model="open"
    title="Configurações de Notificação"
    @submit="salvarConfiguracoes"
  >
    <div class="notification-settings-container">
      <div
        v-for="(item, index) in data"
        :key="item.id"
        class="notification-card"
      >
        <div class="notification-header">
          <div class="notification-icon-wrapper">
            <va-icon
              :name="getNotificationIcon(item.notificationType?.key)"
              :color="getNotificationColor(item.notificationType?.key)"
              size="24px"
            />
          </div>
          <h6
            class="notification-title"
            v-if="item.notificationType?.description"
          >
            {{ item.notificationType.description }}
          </h6>
        </div>

        <div class="notification-options">
          <div
            v-if="item.notificationType.allowEmail"
            class="notification-option"
          >
            <va-icon name="email" size="18px" color="#6b7280" />
            <VaCheckbox
              v-model="form[item.notificationType.key].viaEmail"
              label="Receber por e-mail"
              class="notification-checkbox"
            />
          </div>
          <div
            v-if="item.notificationType.allowSystem"
            class="notification-option"
          >
            <va-icon name="notifications" size="18px" color="#6b7280" />
            <VaCheckbox
              v-model="form[item.notificationType.key].viaSystem"
              label="Receber no sistema"
              class="notification-checkbox"
            />
          </div>
        </div>
      </div>
    </div>
  </ZFormModal>
</template>

<script>
import ZFormModal from "~/components/molecules/Modal/ZFormModal.vue";
import NOTIFICATIONSETTINGS from "~/graphql/notification-settings/query/notificationSettings.graphql";
import NOTIFICATIONSETTINGSEDIT from "~/graphql/notification-settings/mutation/notificationSettingEdit.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  name: "ZNotificationSettingsForm",
  components: { ZFormModal },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      data: [],
      form: {},
    };
  },
  mounted() {
    this.getNotificationSettings();
  },
  computed: {
    open: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  methods: {
    getNotificationIcon(key) {
      const iconMap = {
        training_created: "event",
        training_canceled: "cancel",
        training_updated: "edit",
        evaluation_available: "assessment",
        technical_comments: "comment",
      };
      return iconMap[key] || "notifications";
    },
    getNotificationColor(key) {
      const colorMap = {
        training_created: "#10b981",
        training_canceled: "#ef4444",
        training_updated: "#3b82f6",
        evaluation_available: "#f59e0b",
        technical_comments: "#8b5cf6",
      };
      return colorMap[key] || "#6b7280";
    },
    getNotificationSettings() {
      const query = gql`
        ${NOTIFICATIONSETTINGS}
      `;

      const consult = {};
      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        const settings = result?.data?.notificationsSettings.data;
        if (Array.isArray(settings)) {
          this.data = settings;

          this.form = {};
          settings.forEach((item) => {
            const key = item.notificationType.key;
            this.form[key] = {
              viaEmail: item.viaEmail,
              viaSystem: item.viaSystem,
            };
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
          const key = item.notificationType.key;
          const variables = {
            id: parseInt(item.id, 10),
            notificationTypeId: parseInt(item.notificationType.id, 10),
            viaEmail: this.form[key].viaEmail,
            viaSystem: this.form[key].viaSystem,
          };

          const { mutate } = useMutation(mutation, { variables });
          const { data } = mutate();
        });

        await Promise.all(promises);

        confirmSuccess("Configurações salvas com sucesso!");
        this.$emit("update:modelValue", false);
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
.notification-settings-container {
  padding: 8px 0;
}

.notification-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.notification-card:last-child {
  margin-bottom: 0;
}

.notification-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.notification-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.notification-option:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.notification-checkbox {
  flex: 1;
}

.notification-checkbox :deep(.va-checkbox__label) {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.notification-checkbox :deep(.va-checkbox__input-wrapper) {
  margin-right: 8px;
}

/* Responsividade */
@media (min-width: 640px) {
  .notification-options {
    flex-direction: row;
    gap: 16px;
  }

  .notification-option {
    flex: 1;
  }
}
</style>
