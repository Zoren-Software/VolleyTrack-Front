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

  <VaModal
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    size="large"
    close-button
    :no-dismiss="false"
    hide-default-actions
    class="bulk-create-modal"
  >
    <template #header>
      <h5 class="modal-title">Cadastrar Treinos Futuros</h5>
    </template>

    <div class="bulk-create-form">
      <div class="form-content">
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
                @update:model-value="onYearChange"
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

        <!-- Info Box -->
        <div class="info-box">
          <p class="info-text">
            <strong>Nota:</strong> Os treinos serão criados automaticamente com:
          </p>
          <ul class="info-list">
            <li>
              Nome: "Nome do treino #1", "Nome do treino #2", é o nome
              provisório do treino, você poderá alterar depois
            </li>
            <li>
              Descrição: "Descreva aqui a descrição detalhada de cada treino na
              edição do treino"
            </li>
            <li>
              Fundamentos: Os fundamentos devem ser definidos na edição de cada
              treino
            </li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <va-button
          preset="secondary"
          @click="close"
        >
          Cancelar
        </va-button>
        <va-button
          color="#E9742B"
          :disabled="loading"
          @click="handleSubmit"
        >
          Cadastrar
        </va-button>
      </div>
    </template>
  </VaModal>
</template>

<script>
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam.vue";
import ZTimeInput from "~/components/atoms/Inputs/ZTimeInput.vue";
import TRAININGBULKCREATE from "~/graphql/training/mutation/trainingBulkCreate.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  name: "ZTrainingBulkCreateModal",
  components: {
    ZSelectTeam,
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
  methods: {
    onYearChange(newYear) {
      // Quando o ano mudar, atualizar a data de fim para 31 de dezembro do novo ano
      if (newYear && this.form.endDate) {
        const currentEndDateYear = new Date(this.form.endDate).getFullYear();

        // Só atualizar se o ano da data de fim for diferente do novo ano
        if (currentEndDateYear !== newYear) {
          // Usar setTimeout para evitar conflitos com a validação do form
          setTimeout(() => {
            this.form.endDate = new Date(newYear, 11, 31); // 31 de dezembro
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
      };
      this.errors = {};
    },
    async handleSubmit() {
      // Se já está carregando, não fazer nada
      if (this.loading) {
        return;
      }

      // Limpar erros anteriores
      this.errors = {};

      // Obter ID do time (ZSelectTeam retorna array mesmo com single selection)
      let teamId;
      if (Array.isArray(this.form.team) && this.form.team.length > 0) {
        teamId = this.form.team[0]?.value || this.form.team[0];
      } else if (this.form.team) {
        teamId = this.form.team?.value || this.form.team;
      }

      // Formatar datas
      const startDate = this.formatDate(this.form.startDate);
      const endDate = this.formatDate(this.form.endDate);

      // Formatar horários
      const timeStart = this.formatTime(this.form.timeStart);
      const timeEnd = this.formatTime(this.form.timeEnd);

      // Validar campos obrigatórios antes de enviar para evitar erros GraphQL
      // Se algum campo obrigatório estiver vazio, não enviar e deixar o backend validar
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
        // Não enviar a mutation se algum campo obrigatório estiver vazio
        // O backend validará quando enviarmos, mas precisamos garantir valores não-null
        // Enviar valores padrão inválidos que o backend possa validar
        // Mas isso não é ideal, então vamos apenas não enviar e mostrar erro
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
          this.close();
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

          // Criar um título para essas validações que serão mostradas
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
/* Modal simplificado */
.bulk-create-modal :deep(.va-modal__container) {
  border-radius: 16px;
}

.bulk-create-modal :deep(.va-modal__header) {
  padding: 24px 24px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.bulk-create-modal :deep(.va-modal__content) {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

/* Footer do modal */
.bulk-create-modal :deep(.va-modal__footer) {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

.modal-footer .va-button {
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 20px;
  transition: all 0.2s ease;
}

.modal-footer .va-button--secondary {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.modal-footer .va-button--secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.modal-footer .va-button[color="#E9742B"],
.modal-footer .va-button[style*="background: #E9742B"] {
  background: #e9742b !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(233, 116, 43, 0.2);
}

.modal-footer .va-button[color="#E9742B"]:hover,
.modal-footer .va-button[style*="background: #E9742B"]:hover {
  background: #d8651f !important;
  box-shadow: 0 4px 8px rgba(233, 116, 43, 0.3);
  transform: translateY(-1px);
}

.modal-footer .va-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Form */
.bulk-create-form {
  position: relative;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
