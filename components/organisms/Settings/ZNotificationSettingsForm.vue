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
          class="mb-2 sm:mb-0 mr-5 mt-3"
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
