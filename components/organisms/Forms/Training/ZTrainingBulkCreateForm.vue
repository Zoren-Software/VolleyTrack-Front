<template>
  <VaModal
    v-model="loading"
    :no-dismiss="true"
    size="small"
    hide-default-actions
    class="loading-modal"
  >
    <div class="loading-modal-content">
      <va-progress-circle indeterminate size="large" />
      <p class="loading-text">Criando treinos em massa...</p>
      <p class="loading-subtext">Por favor, aguarde</p>
    </div>
  </VaModal>

  <div class="form-container">
    <va-stepper
      v-model="step"
      :steps="steps"
      controls-hidden
      class="bulk-create-stepper"
    >
      <template #step-content-0>
        <div class="wizard-step-inner">
          <va-card class="info-card">
            <h2 class="section-title">Informações Básicas</h2>
            <div class="form-grid">
              <div class="form-field team-field">
                <ZSelectTeam
                  v-model="form.team"
                  label="Time *"
                  placeholder="Selecione o time"
                  :error-messages="errors.teamId || []"
                />
              </div>

              <div class="form-field">
                <label class="field-label">Ano *</label>
                <va-select
                  v-model="form.year"
                  :options="yearOptions"
                  placeholder="Selecione o ano"
                  :error="errors.year && errors.year.length > 0"
                  :error-messages="errors.year || []"
                  @update:model-value="onYearChange"
                />
              </div>
            </div>
          </va-card>
        </div>
      </template>

      <template #step-content-1>
        <div class="wizard-step-inner">
          <va-card class="info-card">
            <h2 class="section-title">Período e Horários</h2>
            <div class="form-grid">
              <div class="form-field">
                <VaDateInput
                  v-model="form.startDate"
                  name="startDate"
                  label="Data de Início *"
                  placeholder="Selecione a data de início"
                  style="width: 100%"
                  :error="errors.startDate && errors.startDate.length > 0"
                  :error-messages="errors.startDate || []"
                />
              </div>

              <div class="form-field">
                <VaDateInput
                  v-model="form.endDate"
                  name="endDate"
                  label="Data de Fim *"
                  placeholder="Selecione a data de fim"
                  style="width: 100%"
                  :error="errors.endDate && errors.endDate.length > 0"
                  :error-messages="errors.endDate || []"
                />
              </div>
            </div>
            <p class="field-hint">
              Os treinos serão criados no período entre as datas selecionadas.
            </p>

            <div class="form-grid form-grid--spaced">
              <div class="form-field">
                <ZTimeInput
                  id="time-start-bulk"
                  v-model="form.timeStart"
                  label="Horário Início *"
                  :error-messages="errors.timeStart || []"
                />
              </div>

              <div class="form-field">
                <ZTimeInput
                  id="time-end-bulk"
                  v-model="form.timeEnd"
                  label="Horário Fim *"
                  :error-messages="errors.timeEnd || []"
                />
              </div>
            </div>
          </va-card>

          <va-card class="info-card">
            <div class="days-section">
              <h2 class="section-title">Dias da semana</h2>
              <div
                class="days-checkbox-list"
                role="group"
                aria-label="Dias da semana"
              >
                <label
                  v-for="day in daysOfWeekOptions"
                  :key="day.value"
                  :class="[
                    'day-checkbox-card',
                    {
                      'day-checkbox-card--selected':
                        form.daysOfWeek.includes(day.value),
                    },
                  ]"
                >
                  <input
                    type="checkbox"
                    class="day-checkbox-input"
                    :checked="form.daysOfWeek.includes(day.value)"
                    @change="toggleDay(day.value, $event.target.checked)"
                  />
                  <span class="day-checkbox-label">{{ day.label }}</span>
                </label>
              </div>
              <div v-if="errors.daysOfWeek" class="error-message">
                {{ errors.daysOfWeek[0] }}
              </div>
            </div>
          </va-card>
        </div>
      </template>
    </va-stepper>

    <div class="action-buttons">
      <va-button
        v-if="step === 0"
        color="secondary"
        class="mr-1"
        @click="onCancel"
      >
        Voltar
      </va-button>
      <va-button
        v-else
        color="secondary"
        class="mr-1"
        @click="step = Math.max(0, step - 1)"
      >
        Anterior
      </va-button>

      <va-button v-if="step === 0" color="primary" :disabled="loading" @click="step = 1">
        Próximo
      </va-button>
      <va-button
        v-else
        color="primary"
        :disabled="loading"
        :loading="loading"
        @click="handleSubmit"
      >
        Salvar
      </va-button>
    </div>
  </div>
</template>

<script>
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam.vue";
import ZTimeInput from "~/components/atoms/Inputs/ZTimeInput.vue";
import TRAININGBULKCREATE from "~/graphql/training/mutation/trainingBulkCreate.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  name: "ZTrainingBulkCreateForm",
  components: {
    ZSelectTeam,
    ZTimeInput,
  },
  emits: ["cancel", "success"],
  data() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 5; i++) {
      years.push(i);
    }

    const defaultTimeStart = new Date();
    defaultTimeStart.setHours(18, 0, 0, 0);
    const defaultTimeEnd = new Date();
    defaultTimeEnd.setHours(19, 0, 0, 0);

    return {
      loading: false,
      step: 0,
      errors: {},
      form: {
        team: null,
        year: currentYear,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(currentYear, 11, 31)),
        daysOfWeek: [],
        timeStart: defaultTimeStart,
        timeEnd: defaultTimeEnd,
      },
      yearOptions: years,
      daysOfWeekOptions: [
        { label: "Domingo", value: 0 },
        { label: "Segunda-feira", value: 1 },
        { label: "Terça-feira", value: 2 },
        { label: "Quarta-feira", value: 3 },
        { label: "Quinta-feira", value: 4 },
        { label: "Sexta-feira", value: 5 },
        { label: "Sábado", value: 6 },
      ],
    };
  },
  computed: {
    steps() {
      return [{ label: "Informações básicas" }, { label: "Período e horários" }];
    },
  },
  methods: {
    onYearChange(newYear) {
      if (newYear && this.form.endDate) {
        const currentEndDateYear = new Date(this.form.endDate).getFullYear();

        if (currentEndDateYear !== newYear) {
          setTimeout(() => {
            this.form.endDate = new Date(newYear, 11, 31);
          }, 0);
        }
      }
    },
    toggleDay(dayValue, checked) {
      if (checked) {
        if (!this.form.daysOfWeek.includes(dayValue)) {
          this.form.daysOfWeek.push(dayValue);
        }
      } else {
        this.form.daysOfWeek = this.form.daysOfWeek.filter(
          (d) => d !== dayValue
        );
      }
    },
    onCancel() {
      this.resetForm();
      this.$emit("cancel");
    },
    resetForm() {
      const currentYear = new Date().getFullYear();
      const defaultTimeStart = new Date();
      defaultTimeStart.setHours(18, 0, 0, 0);
      const defaultTimeEnd = new Date();
      defaultTimeEnd.setHours(19, 0, 0, 0);

      this.form = {
        team: null,
        year: currentYear,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(currentYear, 11, 31)),
        daysOfWeek: [],
        timeStart: defaultTimeStart,
        timeEnd: defaultTimeEnd,
      };
      this.step = 0;
      this.errors = {};
    },
    async handleSubmit() {
      if (this.loading) {
        return;
      }

      this.errors = {};

      let teamId;
      if (Array.isArray(this.form.team) && this.form.team.length > 0) {
        teamId = this.form.team[0]?.value || this.form.team[0];
      } else if (this.form.team) {
        teamId = this.form.team?.value || this.form.team;
      }

      const startDate = this.formatDate(this.form.startDate);
      const endDate = this.formatDate(this.form.endDate);

      const timeStart = this.formatTime(this.form.timeStart);
      const timeEnd = this.formatTime(this.form.timeEnd);

      if (
        !teamId ||
        !this.form.year ||
        !startDate ||
        !endDate ||
        !this.form.daysOfWeek ||
        this.form.daysOfWeek.length === 0 ||
        !timeStart ||
        !timeEnd
      ) {
        const missingFields = [];
        if (!teamId) missingFields.push("Time");
        if (!this.form.year) missingFields.push("Ano");
        if (!startDate) missingFields.push("Data de início");
        if (!endDate) missingFields.push("Data de fim");
        if (!this.form.daysOfWeek || this.form.daysOfWeek.length === 0)
          missingFields.push("Dias da semana");
        if (!timeStart) missingFields.push("Horário de início");
        if (!timeEnd) missingFields.push("Horário de fim");

        confirmError(
          "Campos obrigatórios não preenchidos!",
          `Por favor, preencha os seguintes campos: ${missingFields.join(", ")}`
        );
        return;
      }

      try {
        this.loading = true;

        const query = gql`
          ${TRAININGBULKCREATE}
        `;

        const variables = {
          teamId: parseInt(teamId),
          year: parseInt(this.form.year),
          startDate,
          endDate,
          daysOfWeek: this.form.daysOfWeek,
          timeStart,
          timeEnd,
          fundamentalId: [],
          specificFundamentalId: [],
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        const count = data?.trainingBulkCreate?.length || 0;

        confirmSuccess(`${count} treino(s) criado(s) com sucesso!`, () => {
          this.resetForm();
          this.$emit("success");
        });
      } catch (error) {
        console.error(error);
        this.loading = false;

        if (
          error.graphQLErrors &&
          error.graphQLErrors[0] &&
          error.graphQLErrors[0].extensions &&
          error.graphQLErrors[0].extensions.validation
        ) {
          this.errors = error.graphQLErrors[0].extensions.validation;

          const errorMessages = Object.values(this.errors)
            .flat()
            .filter((msg) => msg);

          const footer = errorMessages.join("<br>");

          confirmError("Ocorreu um erro ao criar os treinos em massa!", footer);
        } else {
          const errorMessage =
            error.graphQLErrors?.[0]?.message ||
            "Ocorreu um erro ao criar os treinos em massa!";
          confirmError(errorMessage);
        }
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date) return null;
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatTime(time) {
      if (!time) return null;
      if (typeof time === "string") {
        if (time.match(/^\d{2}:\d{2}$/)) {
          return time;
        }
      }
      const date = new Date(time);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    },
  },
};
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.bulk-create-stepper {
  width: 100%;
  min-width: 0;
  --va-stepper-step-content-wrapper-padding: 0;
  --va-stepper-step-content-margin: 0.5rem 0 0;
}

.bulk-create-stepper :deep(.va-stepper__content) {
  padding: 0;
  width: 100%;
}

.wizard-step-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-card {
  box-sizing: border-box;
  width: 100%;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.wizard-step-inner .info-card:last-child {
  margin-bottom: 0;
}

.form-section {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: "";
  width: 4px;
  height: 24px;
  background: #ff4e1b;
  border-radius: 2px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-grid--spaced {
  margin-top: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.team-field {
  grid-column: span 2;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.field-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
  font-style: italic;
  line-height: 1.5;
}

.days-section {
  width: 100%;
}

.days-checkbox-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
}

.day-checkbox-card {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s,
    box-shadow 0.2s;
  background: #fff;
  flex: 0 1 auto;
  min-width: 0;
}

.day-checkbox-card:hover {
  border-color: #ffe3d1;
  background: #fffdfb;
}

.day-checkbox-card--selected {
  border-color: #ff4e1b;
  background: #fff4ec;
  box-shadow: 0 0 0 1px rgba(255, 78, 27, 0.2);
}

.day-checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: #ff4e1b;
  cursor: pointer;
  flex-shrink: 0;
}

.day-checkbox-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

.day-checkbox-card--selected .day-checkbox-label {
  color: #111827;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
  padding-top: 0;
  box-sizing: border-box;
}

.action-buttons .va-button {
  border-radius: 8px;
}

.loading-modal :deep(.va-modal__container) {
  max-width: 400px;
  border-radius: 16px;
}

.loading-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
}

.loading-text {
  margin-top: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.loading-subtext {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .team-field {
    grid-column: span 1;
  }

  .days-checkbox-list {
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .va-button {
    width: 100%;
  }
}
</style>
