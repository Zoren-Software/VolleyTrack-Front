<template>
  <VaDateInput
    style="width: 100%"
    v-bind="$attrs"
    :id="id"
    :label="label"
    v-model="internalValue"
    class="mb-3"
    :format="formatFn"
    :parse="parseDate"
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
      default: "",
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
        if (!this.modelValue) return null;
        const date = new Date(this.modelValue);
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      },
      set(value) {
        const isoString = value
          ? new Date(
              value.getTime() - value.getTimezoneOffset() * 60000
            ).toISOString()
          : "";
        this.$emit("update:modelValue", isoString);
      },
    },
  },
  methods: {
    formatFn(date) {
      // Ajuste de fuso horário
      const adjustedDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60000
      );
      const day = adjustedDate.getDate().toString().padStart(2, "0");
      const month = (adjustedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = adjustedDate.getFullYear();
      return `${day}/${month}/${year}`;
    },
    parseDate(text) {
      const [day, month, year] = text.split("/").map(Number);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month - 1, day);
        // Ajuste para garantir que a hora esteja correta no fuso horário local
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      }
      console.error("Invalid date format");
      return "";
    },
  },
};
</script>
