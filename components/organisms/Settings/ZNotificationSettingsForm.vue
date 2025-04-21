<template>
  <ZFormModal
    v-model="open"
    title="Configurações de Notificação"
    @submit="salvarConfiguracoes"
  >
    <VaCheckbox v-model="form.viaEmail" label="Receber por e-mail" />
    <VaCheckbox v-model="form.viaSystem" label="Receber no sistema" />
  </ZFormModal>
</template>

<script>
import ZFormModal from "~/components/molecules/Modal/ZFormModal.vue";

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
      form: {
        viaEmail: true,
        viaSystem: true,
      },
    };
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
  },
};
</script>
