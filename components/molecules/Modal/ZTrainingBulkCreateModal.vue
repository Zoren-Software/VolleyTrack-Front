<template>
  <!-- Modal de Loading -->
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

  <ZModal
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="Cadastrar Treinos Futuros"
    ok-text="Cadastrar"
    cancel-text="Cancelar"
    :ok-disabled="loading"
    @ok="handleSubmit"
    @cancel="close"
  >
    <div class="bulk-create-form">
      <va-form ref="formRef" class="flex flex-col gap-6">
        <!-- Seção: Informações Básicas -->
        <div class="form-section">
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
              />
            </div>
          </div>
        </div>

        <!-- Seção: Período e Horários -->
        <div class="form-section">
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
            Os treinos serão criados no período entre as datas selecionadas
          </p>

          <div class="form-grid" style="margin-top: 16px">
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
        </div>

        <!-- Seção: Dias da Semana -->
        <div class="form-section">
          <h2 class="section-title">Dias da Semana</h2>
          <div class="days-of-week">
            <va-checkbox
              v-for="day in daysOfWeekOptions"
              :key="day.value"
              :model-value="form.daysOfWeek.includes(day.value)"
              :label="day.label"
              @update:model-value="toggleDay(day.value, $event)"
              class="day-checkbox"
            />
          </div>
          <div v-if="errors.daysOfWeek" class="error-message">
            {{ errors.daysOfWeek[0] }}
          </div>
        </div>

        <!-- Seção: Fundamentos (Opcional) -->
        <div class="form-section">
          <h2 class="section-title">Fundamentos (Opcional)</h2>
          <div class="form-grid">
            <div class="form-field">
              <ZSelectFundamental
                v-model="form.fundamentals"
                label="Fundamentos"
                multiple
                placeholder="Selecione os fundamentos"
              />
            </div>

            <div class="form-field">
              <ZSelectSpecificFundamental
                v-model="form.specificFundamentals"
                label="Fundamentos Específicos"
                multiple
                placeholder="Selecione os fundamentos específicos"
              />
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="info-box">
          <p class="info-text">
            <strong>Nota:</strong> Os treinos serão criados automaticamente com:
          </p>
          <ul class="info-list">
            <li>Nome: "Nome do treino #1", "Nome do treino #2", é o nome provisório do treino, você poderá alterar depois</li>
            <li>Descrição: "Descreva aqui a descrição detalhada de cada treino na edição do treino"</li>
          </ul>
        </div>
      </va-form>
    </div>
  </ZModal>
</template>

<script>
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam.vue";
import ZSelectFundamental from "~/components/molecules/Selects/ZSelectFundamental.vue";
import ZSelectSpecificFundamental from "~/components/molecules/Selects/ZSelectSpecificFundamental.vue";
import ZTimeInput from "~/components/atoms/Inputs/ZTimeInput.vue";
import TRAININGBULKCREATE from "~/graphql/training/mutation/trainingBulkCreate.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  name: "ZTrainingBulkCreateModal",
  components: {
    ZModal,
    ZSelectTeam,
    ZSelectFundamental,
    ZSelectSpecificFundamental,
    ZTimeInput,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:modelValue", "success"],
  data() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 5; i++) {
      years.push(i);
    }

      // Criar datas de horário padrão (18:00 e 19:00)
      const defaultTimeStart = new Date();
      defaultTimeStart.setHours(18, 0, 0, 0);
      const defaultTimeEnd = new Date();
      defaultTimeEnd.setHours(19, 0, 0, 0);

      return {
        loading: false,
        errors: {},
        form: {
          team: null,
          year: currentYear,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(currentYear, 11, 31)), // 31 de dezembro do ano atual
          daysOfWeek: [],
          timeStart: defaultTimeStart,
          timeEnd: defaultTimeEnd,
          fundamentals: [],
          specificFundamentals: [],
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
  watch: {
    "form.year"(newYear) {
      // Quando o ano mudar, atualizar a data de fim para 31 de dezembro do novo ano
      if (newYear && this.form.endDate) {
        const currentEndDate = new Date(this.form.endDate);
        this.form.endDate = new Date(newYear, 11, 31); // 31 de dezembro
      }
    },
  },
  methods: {
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
    close() {
      this.$emit("update:modelValue", false);
      this.resetForm();
    },
    resetForm() {
      const currentYear = new Date().getFullYear();
      // Criar datas de horário padrão (18:00 e 19:00)
      const defaultTimeStart = new Date();
      defaultTimeStart.setHours(18, 0, 0, 0);
      const defaultTimeEnd = new Date();
      defaultTimeEnd.setHours(19, 0, 0, 0);

      this.form = {
        team: null,
        year: currentYear,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(currentYear, 11, 31)), // 31 de dezembro do ano atual
        daysOfWeek: [],
        timeStart: defaultTimeStart,
        timeEnd: defaultTimeEnd,
        fundamentals: [],
        specificFundamentals: [],
      };
      this.errors = {};
    },
    async handleSubmit() {
      // Se já está carregando, não fazer nada
      if (this.loading) {
        return;
      }

      // Validação básica
      this.errors = {};

      if (!this.form.team || (Array.isArray(this.form.team) && this.form.team.length === 0)) {
        this.errors.teamId = ["O time é obrigatório"];
        return;
      }

      if (!this.form.year) {
        this.errors.year = ["O ano é obrigatório"];
        return;
      }

      if (!this.form.startDate) {
        this.errors.startDate = ["A data de início é obrigatória"];
        return;
      }

      if (!this.form.endDate) {
        this.errors.endDate = ["A data de fim é obrigatória"];
        return;
      }

      // Validar se data de fim é maior ou igual à data de início
      const startDate = new Date(this.form.startDate);
      const endDate = new Date(this.form.endDate);
      if (endDate < startDate) {
        this.errors.endDate = ["A data de fim deve ser maior ou igual à data de início"];
        return;
      }

      if (!this.form.daysOfWeek || this.form.daysOfWeek.length === 0) {
        this.errors.daysOfWeek = ["Selecione pelo menos um dia da semana"];
        return;
      }

      if (!this.form.timeStart) {
        this.errors.timeStart = ["O horário de início é obrigatório"];
        return;
      }

      if (!this.form.timeEnd) {
        this.errors.timeEnd = ["O horário de fim é obrigatório"];
        return;
      }

      try {
        this.loading = true;

        // Obter ID do time (ZSelectTeam retorna array mesmo com single selection)
        let teamId;
        if (Array.isArray(this.form.team) && this.form.team.length > 0) {
          teamId = this.form.team[0]?.value || this.form.team[0];
        } else if (this.form.team) {
          teamId = this.form.team?.value || this.form.team;
        } else {
          this.errors.teamId = ["O time é obrigatório"];
          return;
        }

        // Formatar datas
        const startDate = this.formatDate(this.form.startDate);
        const endDate = this.formatDate(this.form.endDate);

        // Formatar horários
        const timeStart = this.formatTime(this.form.timeStart);
        const timeEnd = this.formatTime(this.form.timeEnd);

        // Obter IDs dos fundamentos
        const fundamentalIds = this.form.fundamentals
          ? this.form.fundamentals.map((item) =>
              typeof item === "object" ? item.id || item.value : item
            )
          : [];

        const specificFundamentalIds = this.form.specificFundamentals
          ? this.form.specificFundamentals.map((item) =>
              typeof item === "object" ? item.id || item.value : item
            )
          : [];

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
          fundamentalId: fundamentalIds.length > 0 ? fundamentalIds : [],
          specificFundamentalId:
            specificFundamentalIds.length > 0 ? specificFundamentalIds : [],
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        const count = data?.trainingBulkCreate?.length || 0;

        confirmSuccess(
          `${count} treino(s) criado(s) com sucesso!`,
          () => {
            this.close();
            this.$emit("success");
          }
        );
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

          confirmError("Erro ao criar treinos em massa!", errorMessages);
        } else {
          confirmError("Erro ao criar treinos em massa!");
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
        // Se já está no formato HH:mm, retornar
        if (time.match(/^\d{2}:\d{2}$/)) {
          return time;
        }
      }
      // Se for um objeto Date ou similar, formatar
      const date = new Date(time);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    },
  },
};
</script>

<style scoped>
.bulk-create-form {
  position: relative;
}

.form-section {
  margin-bottom: 24px;
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
  background: #e9742b;
  border-radius: 2px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
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

.days-of-week {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.day-checkbox {
  margin: 0;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.info-box {
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 20px;
  margin-top: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-text {
  font-size: 14px;
  color: #1e40af;
  margin-bottom: 12px;
  font-weight: 500;
}

.info-list {
  margin: 0;
  padding-left: 20px;
  color: #1e40af;
  font-size: 13px;
  line-height: 1.6;
}

.info-list li {
  margin-bottom: 6px;
}

/* Remover bordas estranhas das labels */
.bulk-create-form :deep(.va-input-wrapper__label) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.bulk-create-form :deep(.va-date-input-wrapper__label) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* Loading Modal */
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

  .days-of-week {
    grid-template-columns: 1fr;
  }
}
</style>

