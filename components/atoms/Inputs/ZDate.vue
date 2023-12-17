<template>
  <VaDateInput
    style="width: 100%"
    v-bind="$attrs"
    :id="id"
    :label="label"
    v-model="internalValue"
    class="mb-3"
  />
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
    modelValue: {
      type: String,
      default: () => "",
    },
    rules: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: "text",
    },
    messages: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", this.formatDate(value));
      },
    },
  },
  methods: {
    formatDate(date) {
      if (typeof date === "string") {
        // Se a data já estiver em formato de string, substitua '-' por '/'
        return date.replace(/-/g, "/");
      } else if (date instanceof Date) {
        // Se for um objeto Date, formate manualmente para 'YYYY/MM/DD'
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 porque getMonth() começa em 0
        const day = date.getDate().toString().padStart(2, "0");

        return `${day}/${month}/${year}`;
      } else {
        // Se não for uma data válida, retorna um valor padrão ou lança um erro
        return ""; // ou throw new Error("Invalid date format");
      }
    },
  },
};
</script>
