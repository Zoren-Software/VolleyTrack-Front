<template>
  <div class="row">
    <div class="flex flex-col md6 mb-2 pr-2">
      <VaDateInput
        v-model="dateValue"
        name="dateStart"
        label="Data Treino"
        id="date-training"
        style="width: 100%"
        class="mb-3"
      />
    </div>
    <div class="flex flex-col md3 mb-2 pr-2">
      <ZTimeInput
        ampm
        v-model="timeStartValue"
        name="timeStart"
        label="Horário Inicio"
        id="time-start"
        class="mb-3"
      />
    </div>
    <div class="flex flex-col md3 mb-2">
      <ZTimeInput
        ampm
        v-model="timeEndValue"
        name="timeEnd"
        label="Horário Fim"
        id="time-end"
        class="mb-3"
      />
    </div>
  </div>
</template>

<script>
import ZDate from "~/components/atoms/Inputs/ZDate";
import ZTimeInput from "../../atoms/Inputs/ZTimeInput.vue";

export default {
  components: {
    ZDate,
    ZTimeInput,
  },

  props: {
    date: {
      type: [Date, String],
      default: "",
    },
    timeStart: {
      type: [Date, String],
      default: "",
    },
    timeEnd: {
      type: [Date, String],
      default: "",
    },
  },

  computed: {
    dateValue: {
      get() {
        return this.date || ""; // Garante que o valor não seja null
      },
      set(value) {
        this.updateDate(value);
      },
    },
    timeStartValue: {
      get() {
        // Convertendo a string para Date se necessário
        return this.timeStart instanceof Date
          ? this.timeStart
          : new Date(this.timeStart);
      },
      set(value) {
        this.updateTimeStart(value);
      },
    },
    timeEndValue: {
      get() {
        // Convertendo a string para Date se necessário
        return this.timeEnd instanceof Date
          ? this.timeEnd
          : new Date(this.timeEnd);
      },
      set(value) {
        this.updateTimeEnd(value);
      },
    },
  },

  methods: {
    formatFn(date) {
      return `${date.getDate()} - ${
        monthNames[date.getMonth()]
      } - ${date.getFullYear()}`;
    },
    parseFn(text) {
      const [day, monthName, year] = text.split(" - ");

      const month = monthNames.findIndex((m) => m === monthName);

      return new Date(year, month, day);
    },
    updateDate(value) {
      this.$emit("update:date", value);
    },
    updateTimeStart(value) {
      // Certifique-se de que o valor é um objeto Date antes de emitir
      const timeValue = value instanceof Date ? value : new Date(value);
      this.$emit("update:timeStart", timeValue);
    },
    updateTimeEnd(value) {
      // Certifique-se de que o valor é um objeto Date antes de emitir
      const timeValue = value instanceof Date ? value : new Date(value);
      this.$emit("update:timeEnd", timeValue);
    },
  },

  watch: {
    date(newVal) {
      if (typeof newVal === "string") {
        this.updateDate(new Date(newVal));
      }
    },
    timeStart(newVal) {
      if (typeof newVal === "string") {
        this.updateTimeStart(new Date(newVal));
      }
    },
    timeEnd(newVal) {
      if (typeof newVal === "string") {
        this.updateTimeEnd(new Date(newVal));
      }
    },
  },
};
</script>
