<template>
  <ZModal
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="title"
    ok-text="Salvar"
    cancel-text="Cancelar"
  >
    <template #default>
      <form @submit.prevent="$emit('submit')">
        <slot />
      </form>
    </template>
  </ZModal>
</template>

<script>
import ZModal from "~/components/atoms/Modal/ZModal.vue";

export default {
  name: "ZFormModal",
  components: { ZModal },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "Formulário",
    },
  },
  emits: ["update:modelValue", "submit"],
};
</script>
