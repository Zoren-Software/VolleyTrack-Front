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
      <p class="loading-text">Editando treinos em massa...</p>
      <p class="loading-subtext">Por favor, aguarde</p>
    </div>
  </VaModal>

  <ZModal
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="Editar Treinos em Massa"
    ok-text="Salvar Alterações"
    cancel-text="Cancelar"
    :ok-disabled="loading || !hasChanges"
    @ok="handleSubmit"
    @cancel="close"
  >
    <div class="bulk-edit-form">
      <va-form ref="formRef" class="flex flex-col gap-6">
        <!-- Info sobre seleção -->
        <div class="info-box selection-info">
          <va-icon name="info" size="small" />
          <p class="info-text">
            <strong>{{ selectedCount }}</strong> treino(s) criado(s) em massa selecionado(s) para edição
          </p>
        </div>

        <!-- Seção: Alterar Dia da Semana -->
        <div class="form-section">
          <h2 class="section-title">Alterar Dia da Semana</h2>
          <div class="form-field">
            <label class="field-label">Novo Dia da Semana</label>
            <va-select
              v-model="form.newDayOfWeek"
              :options="daysOfWeekOptions"
              placeholder="Selecione o novo dia da semana (opcional)"
              clearable
            />
            <p class="field-hint">
              Se selecionado, os treinos serão movidos para o novo dia da semana mantendo o mesmo horário
            </p>
          </div>
        </div>

        <!-- Seção: Alterar Horários -->
        <div class="form-section">
          <h2 class="section-title">Alterar Horários</h2>
          <div class="form-grid">
            <div class="form-field">
              <ZTimeInput
                id="new-time-start"
                v-model="form.newTimeStart"
                label="Novo Horário Início"
              />
              <p class="field-hint">Deixe em branco para manter o horário atual</p>
            </div>

            <div class="form-field">
              <ZTimeInput
                id="new-time-end"
                v-model="form.newTimeEnd"
                label="Novo Horário Fim"
              />
              <p class="field-hint">Deixe em branco para manter o horário atual</p>
            </div>
          </div>
        </div>

        <!-- Seção: Alterar Nome e Descrição -->
        <div class="form-section">
          <h2 class="section-title">Alterar Informações</h2>
          <div class="form-grid">
            <div class="form-field">
              <label class="field-label">Novo Nome</label>
              <va-input
                v-model="form.newName"
                placeholder="Deixe em branco para manter o nome atual"
                clearable
              />
            </div>
            <div class="form-field">
              <label class="field-label">Novo Status</label>
              <va-select
                v-model="form.newStatus"
                :options="statusOptions"
                placeholder="Selecione o status (opcional)"
                clearable
              />
            </div>
          </div>
          <div class="form-field" style="margin-top: 16px">
            <label class="field-label">Nova Descrição</label>
            <va-textarea
              v-model="form.newDescription"
              placeholder="Deixe em branco para manter a descrição atual"
              :rows="3"
            />
          </div>
        </div>

        <!-- Seção: Deslocar Datas -->
        <div class="form-section">
          <h2 class="section-title">Deslocar Datas</h2>
          <div class="form-field">
            <label class="field-label">Deslocar em dias</label>
            <va-input
              v-model.number="form.shiftDays"
              type="number"
              placeholder="Ex: 7 (adiciona 7 dias), -3 (subtrai 3 dias)"
              clearable
            />
            <p class="field-hint">
              Use números positivos para adiantar as datas ou negativos para atrasar. Deixe em branco para não deslocar.
            </p>
          </div>
        </div>

        <!-- Resumo das alterações -->
        <div v-if="hasChanges" class="info-box changes-summary">
          <p class="info-text">
            <strong>Resumo das alterações:</strong>
          </p>
          <ul class="info-list">
            <li v-if="form.newDayOfWeek !== null">
              Dia da semana: {{ getDayName(form.newDayOfWeek) }}
            </li>
            <li v-if="form.newTimeStart">
              Horário início: {{ formatTime(form.newTimeStart) }}
            </li>
            <li v-if="form.newTimeEnd">
              Horário fim: {{ formatTime(form.newTimeEnd) }}
            </li>
            <li v-if="form.newName">
              Nome: {{ form.newName }}
            </li>
            <li v-if="form.newDescription">
              Descrição: {{ form.newDescription.substring(0, 50) }}{{ form.newDescription.length > 50 ? '...' : '' }}
            </li>
            <li v-if="form.newStatus !== null">
              Status: {{ form.newStatus ? 'Ativo' : 'Inativo' }}
            </li>
            <li v-if="form.shiftDays !== null && form.shiftDays !== 0">
              Deslocamento: {{ form.shiftDays > 0 ? '+' : '' }}{{ form.shiftDays }} dia(s)
            </li>
          </ul>
        </div>
      </va-form>
    </div>
  </ZModal>
</template>

<script>
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import ZTimeInput from "~/components/atoms/Inputs/ZTimeInput.vue";
import TRAININGBULKEDIT from "~/graphql/training/mutation/trainingBulkEdit.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  name: "ZTrainingBulkEditModal",
  components: {
    ZModal,
    ZTimeInput,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    selectedTrainings: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue", "success"],
  data() {
    return {
      loading: false,
      form: {
        newDayOfWeek: null,
        newTimeStart: null,
        newTimeEnd: null,
        newName: null,
        newDescription: null,
        newStatus: null,
        shiftDays: null,
      },
      statusOptions: [
        { label: "Ativo", value: true },
        { label: "Inativo", value: false },
      ],
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
    selectedCount() {
      return this.selectedTrainings.length;
    },
    hasChanges() {
      return (
        this.form.newDayOfWeek !== null ||
        this.form.newTimeStart !== null ||
        this.form.newTimeEnd !== null ||
        this.form.newName !== null ||
        this.form.newDescription !== null ||
        this.form.newStatus !== null ||
        (this.form.shiftDays !== null && this.form.shiftDays !== 0)
      );
    },
  },
  methods: {
    close() {
      this.$emit("update:modelValue", false);
      this.resetForm();
    },
    resetForm() {
      this.form = {
        newDayOfWeek: null,
        newTimeStart: null,
        newTimeEnd: null,
        newName: null,
        newDescription: null,
        newStatus: null,
        shiftDays: null,
      };
    },
    getDayName(dayValue) {
      const day = this.daysOfWeekOptions.find((d) => d.value === dayValue);
      return day ? day.label : "";
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
    async handleSubmit() {
      if (this.loading) {
        return;
      }

      if (!this.hasChanges) {
        confirmError("Selecione pelo menos uma alteração para aplicar");
        return;
      }

      if (this.selectedTrainings.length === 0) {
        confirmError("Nenhum treino selecionado");
        return;
      }

      try {
        this.loading = true;

        const trainingIds = this.selectedTrainings.map((t) => String(t.id));

        const variables = {
          trainingIds,
          newDayOfWeek: this.form.newDayOfWeek !== null ? this.form.newDayOfWeek : undefined,
          newTimeStart: this.form.newTimeStart ? this.formatTime(this.form.newTimeStart) : undefined,
          newTimeEnd: this.form.newTimeEnd ? this.formatTime(this.form.newTimeEnd) : undefined,
          newName: this.form.newName && this.form.newName.trim() !== '' ? this.form.newName.trim() : undefined,
          newDescription: this.form.newDescription && this.form.newDescription.trim() !== '' ? this.form.newDescription.trim() : undefined,
          newStatus: this.form.newStatus !== null ? this.form.newStatus : undefined,
          shiftDays: this.form.shiftDays !== null && this.form.shiftDays !== 0 ? this.form.shiftDays : undefined,
        };

        // Remover campos undefined
        Object.keys(variables).forEach((key) => {
          if (variables[key] === undefined) {
            delete variables[key];
          }
        });

        const query = gql`
          ${TRAININGBULKEDIT}
        `;

        const { mutate } = await useMutation(query, { variables });
        const { data } = await mutate();

        const count = data?.trainingBulkEdit?.length || 0;

        confirmSuccess(
          `${count} treino(s) atualizado(s) com sucesso!`,
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
          const errorMessages = Object.values(error.graphQLErrors[0].extensions.validation)
            .flat()
            .filter((msg) => msg);

          confirmError("Erro ao editar treinos em massa!", errorMessages);
        } else {
          confirmError("Erro ao editar treinos em massa!");
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.bulk-edit-form {
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

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.field-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  font-style: italic;
  line-height: 1.5;
}

.info-box {
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.selection-info .va-icon {
  color: #0369a1;
}

.changes-summary {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
}

.info-text {
  font-size: 14px;
  color: #1e40af;
  margin: 0;
  font-weight: 500;
}

.changes-summary .info-text {
  color: #92400e;
}

.info-list {
  margin: 8px 0 0 0;
  padding-left: 20px;
  color: #1e40af;
  font-size: 13px;
  line-height: 1.6;
}

.changes-summary .info-list {
  color: #92400e;
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
}
</style>

