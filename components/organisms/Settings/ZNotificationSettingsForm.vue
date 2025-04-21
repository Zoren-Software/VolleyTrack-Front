<template>
  <ZFormModal
    v-model="open"
    title="Configurações de Notificação"
    @submit="salvarConfiguracoes"
  >
    <div
      v-for="(item, index) in data"
      :key="item.id"
      class="mb-6 pb-3 border-b border-gray-200 last:border-b-0 mt-3"
    >
      <h6
        class="text-base font-semibold text-gray-700 mb-2 va-h6"
        v-if="item.notificationType?.description"
      >
        {{ item.notificationType.description }}
      </h6>

      <div
        class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pl-2"
      >
        <VaCheckbox
          v-if="item.notificationType.allowEmail"
          v-model="form[item.notificationType.key].viaEmail"
          label="Receber por e-mail"
        />
        <VaCheckbox
          v-if="item.notificationType.allowSystem"
          v-model="form[item.notificationType.key].viaSystem"
          label="Receber no sistema"
        />
      </div>
    </div>
  </ZFormModal>
</template>

<script>
import ZFormModal from "~/components/molecules/Modal/ZFormModal.vue";
import NOTIFICATIONSETTINGS from "~/graphql/notification-settings/query/notificationSettings.graphql";

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
    salvarConfiguracoes() {
      console.log("Salvar configurações de notificação:", this.form);
      this.$emit("update:modelValue", false);
    },

    getNotificationSettings() {
      console.log("getNotificationSettings");

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
  },
};
</script>
