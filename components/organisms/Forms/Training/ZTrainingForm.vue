<template>
  <div
    class="form-container"
    :class="{ 'form-container-full-width': controlledStep === 2 }"
  >
    <va-card
      class="training-form-card"
      :class="{ 'training-form-card-full-width': controlledStep === 2 }"
          >
      <va-form ref="myForm" class="flex flex-col gap-6 mb-2">
        <va-stepper v-model="controlledStep" :steps="steps" controls-hidden>
          <!-- Etapa 1: Informações Essenciais -->
        <template #step-content-0>
            <div class="step-content">
              <h2 class="section-title">Informações Essenciais</h2>
          <ZTextInput
            id="name"
            v-model="form.name"
            name="name"
            label="Nome"
            class="mb-3"
            :error-messages="errors.name || []"
          />
          <ZDateTimeRangePicker
            id="dateTimeRange"
            label="Data Inicio"
            clearable
            :date="form.dateValue"
            :time-start="form.timeStartValue"
            :time-end="form.timeEndValue"
            @update:date="form.dateValue = $event"
            @update:time-start="form.timeStartValue = $event"
            @update:time-end="form.timeEndValue = $event"
          />
          <VaTextarea
                id="description"
            v-model="form.description"
            style="width: 100%"
            name="description"
            label="Descrição do Treino"
            class="mb-3"
            :error="errorFields.includes('description')"
            :error-messages="errors.description || []"
          />

              <h3 class="subsection-title">Fundamentos</h3>
          <div class="mb-5">
            <ZListRelationFundamentals
                  :items="form.fundamentals || []"
              :selected-value="fundamentals"
              @add="addFundamentals"
              @delete="actionDeleteFundamental"
            >
              <template #filter>
                <ZSelectFundamental
                  v-model="fundamentals"
                  class="mb-3"
                  label="Fundamentos"
                  :ignore-ids="form.fundamentals.map((item) => item.id)"
                />
              </template>
            </ZListRelationFundamentals>
          </div>
          <div>
            <ZListRelationSpecificFundamentals
                  :items="form.specificFundamentals || []"
              :selected-value="specificFundamentals"
              @add="addSpecificFundamental"
              @delete="actionDeleteSpecificFundamental"
            >
              <template #filter>
                <ZSelectSpecificFundamental
                  v-model="specificFundamentals"
                  class="mb-3"
                  label="Fundamentos Específicos"
                  :disabled="!form.fundamentals.length"
                      :ignore-ids="
                        form.specificFundamentals.map((item) => item.id)
                      "
                      :fundamentals-ids="
                        form.fundamentals.map((item) => item.id)
                      "
                  :messages="messageSpecificFundamental()"
                />
              </template>
            </ZListRelationSpecificFundamentals>
          </div>

              <h3 class="subsection-title">Relacionar Time</h3>
          <ZListRelationTeams
                :items="form.teams || []"
            :selected-value="teams"
            @add="addTeams"
            @delete="actionDeleteTeam"
          >
            <template #filter>
              <ZSelectTeam
                ref="selectTeamRef"
                v-model="teams"
                class="mb-3"
                label="Times"
                :disabled="form.teams.length >= 1"
                :ignore-ids="form.teams.map((item) => item.id)"
                :messages="
                  form.teams.length >= 1 ? 'Você já selecionou um time' : ''
                "
              />
            </template>
          </ZListRelationTeams>
            </div>
        </template>

          <!-- Etapa 2: Chamada do Treino -->
          <template #step-content-1>
            <div class="step-content">
              <h2 class="section-title">Chamada do Treino</h2>

              <!-- Métricas Cards -->
              <div class="metrics-section">
                <div class="metrics-cards">
                    <ZCardViewMetricsPresenceIntention
                      title="Métricas do treino, intenção de presença"
                      :strip="false"
                      :data="confirmationTrainingMetrics"
                    />
                    <ZCardViewMetricsRealPresence
                      title="Métricas do treino, presença real"
                      :strip="false"
                      :data="confirmationTrainingMetrics"
                    />
                  </div>

                <!-- Progress Bars -->
                <div class="progress-bars-section">
                    <ZProgressBarMetricsTraining
                      :metrics="confirmationTrainingMetrics"
                      :data="form"
                    />
                  </div>
                </div>

              <!-- Lista de Jogadores -->
              <div class="players-list-section">
                <ZListRelationConfirmationTrainings
                  :items="form.confirmationsTraining"
                  :training-date="form.dateValue"
                  @action-confirm="actionConfirm"
                  @action-reject="actionReject"
                  @action-confirm-presence="actionConfirmPresence"
                />
              </div>
              </div>
            </template>

          <!-- Etapa 3: Marcação dos Scouts -->
          <template #step-content-2>
            <div class="step-content step-content-full-width">
          <ZListRelationPlayersWithScouts
            ref="listRelationPlayersWithScoutsRef"
            :training-id="form.id"
            :items="[...(form.players || []), ...(form.scouts || [])]"
            @add="addPlayers"
            @delete="actionDeletePlayer"
          >
          </ZListRelationPlayersWithScouts>
            </div>
        </template>
      </va-stepper>
    </va-form>
  </va-card>

    <!-- Botões de Ação (Fora do Card) -->
    <div class="action-buttons">
      <va-button color="secondary" @click="goBack" class="mr-1"
        >Voltar</va-button
      >
      <va-button
        v-if="controlledStep > 0"
        color="secondary"
        @click="handlePrevStep()"
        class="mr-1"
        >Anterior</va-button
      >
      <va-button
        v-if="controlledStep < steps.length - 1"
        color="primary"
        @click="handleNextStep()"
        class="mr-1"
        >Próximo</va-button
      >
      <va-button
        color="success"
        @click="saveAndContinue()"
        v-if="!isTrainingSaved && controlledStep === 0"
        class="mr-1"
        >Salvar e Continuar</va-button
      >
      <va-button
        color="success"
        @click="saveScoutsOnly()"
        v-if="isTrainingSaved && controlledStep === 2"
        class="mr-1"
        >Salvar Scouts</va-button
      >
      <va-button color="primary" @click="save()">Salvar</va-button>
    </div>
  </div>
</template>

<script>
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZListRelationFundamentals from "~/components/organisms/List/Relations/ZListRelationFundamentals";
import ZListRelationSpecificFundamentals from "~/components/organisms/List/Relations/ZListRelationSpecificFundamentals";
import ZListRelationTeams from "~/components/organisms/List/Relations/ZListRelationTeams";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
import ZDateTimeRangePicker from "~/components/molecules/Inputs/ZDateTimeRangePicker.vue";
import ZSelectFundamental from "~/components/molecules/Selects/ZSelectFundamental.vue";
import ZSelectSpecificFundamental from "~/components/molecules/Selects/ZSelectSpecificFundamental.vue";
import ZListRelationConfirmationTrainings from "~/components/organisms/List/Relations/ZListRelationConfirmationTrainings";
import ZCardViewMetricsRealPresence from "~/components/molecules/Cards/ZCardViewMetricsRealPresence";
import ZCardViewMetricsPresenceIntention from "~/components/molecules/Cards/ZCardViewMetricsPresenceIntention";
import ZProgressBarMetricsTraining from "~/components/molecules/ProgressBar/ZProgressBarMetricsTraining";
import CONFIRMTRAINING from "~/graphql/training/mutation/confirmTraining.graphql";
import CONFIRMPRESENCE from "~/graphql/training/mutation/confirmPresence.graphql";
import ZListRelationPlayersWithScouts from "~/components/molecules/Datatable/ZListRelationPlayersWithScouts";

export default {
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          name: "",
          description: "",
          dateValue: new Date().toString(),
          timeStartValue: new Date(),
          timeEndValue: new Date(new Date().getTime() + 60 * 60 * 1000),
          teams: [],
          fundamentals: [],
          specificFundamentals: [],
          players: [],
        };
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
    errorFields: {
      type: Array,
      default: () => [],
    },
    errors: {
      type: Object,
      default: () => {
        return {
          name: [],
          description: [],
          dateValue: [],
          timeStartValue: [],
          timeEndValue: [],
          teams: [],
          fundamentals: [],
          specificFundamentals: [],
        };
      },
    },
  },
  components: {
    ZTextInput,
    ZSelectTeam,
    ZListRelationFundamentals,
    ZListRelationSpecificFundamentals,
    ZListRelationTeams,
    ZDateTimeRangePicker,
    ZSelectFundamental,
    ZSelectSpecificFundamental,
    ZListRelationConfirmationTrainings,
    ZCardViewMetricsPresenceIntention,
    ZCardViewMetricsRealPresence,
    ZProgressBarMetricsTraining,
    ZListRelationPlayersWithScouts,
  },

  emits: [
    "refresh",
    "update:errors",
    "update:errorFields",
    "saveAndContinue",
    "saveScouts",
  ],

  data() {
    return {
      user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null,
      internalStep: 0,
      positions: [],
      teams: [],
      form: {
        ...this.data,
        players: this.data.players || [],
        scouts: this.data.scouts || [],
        teams: this.data.teams || [],
        fundamentals: this.data.fundamentals || [],
        specificFundamentals: this.data.specificFundamentals || [],
        confirmationsTraining: this.data.confirmationsTraining || [],
        confirmationTrainingMetrics: this.data.confirmationTrainingMetrics || {},
      },
      fundamentals: [],
      specificFundamentals: [],
      users: [],
      players: [],
      scouts: [],
    };
  },

  computed: {
    // Verifica se o treino está salvo (tem ID)
    isTrainingSaved() {
      return this.form.id && this.form.id > 0;
    },
    // Computed property para controlar o step de forma segura
    controlledStep: {
      get() {
        return this.internalStep;
      },
      set(newStep) {
        // Validar se pode acessar a etapa
        if (newStep > 0 && !this.isTrainingSaved) {
          confirmError(
            "Ação não permitida!",
            "Você precisa salvar as informações básicas do treino antes de acessar as etapas de Chamada e Scouts. Por favor, salve o treino primeiro."
          );
          return;
        }
        this.internalStep = newStep;
      },
    },
    // Steps dinâmicos com validação
    steps() {
      return [
        { label: "Informações Essenciais" },
        {
          label: "Chamada do Treino",
          disabled: !this.isTrainingSaved,
        },
        {
          label: "Marcação dos Scouts",
          disabled: !this.isTrainingSaved,
        },
      ];
    },
    // Recalcular métricas baseado nos dados locais de confirmationsTraining
    confirmationTrainingMetrics() {
      const confirmations = this.form.confirmationsTraining || [];
      
      const confirmed = confirmations.filter(c => c.status === 'CONFIRMED' || c.status === 'confirmed').length;
      const pending = confirmations.filter(c => c.status === 'PENDING' || c.status === 'pending').length;
      const rejected = confirmations.filter(c => c.status === 'REJECTED' || c.status === 'rejected').length;
      const presence = confirmations.filter(c => c.presence === true).length;
      const absence = confirmations.filter(c => c.presence === false).length;
      
      const total = confirmed + pending + rejected;
      
      return {
        confirmed,
        pending,
        rejected,
        total,
        confirmedPercentage: total > 0 ? (confirmed / total) * 100 : 0,
        pendingPercentage: total > 0 ? (pending / total) * 100 : 0,
        rejectedPercentage: total > 0 ? (rejected / total) * 100 : 0,
        presence,
        absence,
        presencePercentage: total > 0 ? (presence / total) * 100 : 0,
        absencePercentage: total > 0 ? (absence / total) * 100 : 0,
      };
    },
  },

  watch: {
    data: {
      handler(val) {
        // Se não há dados válidos, não fazer nada
        if (!val || Object.keys(val).length === 0) {
          return;
        }
        
        // Verificar se o form já foi inicializado (tem ID ou dados básicos)
        const isFormInitialized = this.form && (this.form.id || this.form.name);
        
        // Preservar dados existentes que podem ser perdidos apenas se o form já foi inicializado
        const existingTeams = isFormInitialized ? (this.form.teams || []) : [];
        const existingFundamentals = isFormInitialized ? (this.form.fundamentals || []) : [];
        const existingSpecificFundamentals = isFormInitialized ? (this.form.specificFundamentals || []) : [];
        const existingConfirmationsTraining = isFormInitialized ? (this.form.confirmationsTraining || []) : [];

        // Preservar valores de presença real e status dos confirmationsTraining existentes
        let preservedConfirmationsTraining;
        
        if (val.confirmationsTraining && val.confirmationsTraining.length > 0 && isFormInitialized) {
          // Se há novos dados e o form já foi inicializado, mesclar preservando valores de presença e status
          preservedConfirmationsTraining = val.confirmationsTraining.map((newConfirmation) => {
            // Buscar confirmação existente com mesmo ID ou mesmo playerId
            const existingConfirmation = existingConfirmationsTraining.find(
              (existing) => 
                (existing.id && existing.id === newConfirmation.id) ||
                (existing.playerId && existing.playerId === newConfirmation.playerId) ||
                (existing.player?.id && existing.player?.id === newConfirmation.player?.id)
            );
            
            if (existingConfirmation) {
              // Preservar presença se foi marcada (true ou false)
              const preservedPresence = (existingConfirmation.presence !== null && 
                existingConfirmation.presence !== undefined) 
                ? existingConfirmation.presence 
                : newConfirmation.presence;
              
              // Preservar status se foi alterado (não é PENDING)
              const preservedStatus = (existingConfirmation.status && 
                existingConfirmation.status !== 'PENDING' && 
                existingConfirmation.status !== 'pending') 
                ? existingConfirmation.status 
                : newConfirmation.status;
              
              return {
                ...newConfirmation,
                presence: preservedPresence,
                status: preservedStatus,
              };
            }
            
            // Caso contrário, usar os novos dados
            return newConfirmation;
          });
        } else if (val.confirmationsTraining && val.confirmationsTraining.length > 0) {
          // Se é a primeira vez carregando, usar os dados novos diretamente
          preservedConfirmationsTraining = val.confirmationsTraining;
        } else {
          // Se não há novos dados, manter os existentes apenas se já houver dados no form
          preservedConfirmationsTraining = isFormInitialized ? existingConfirmationsTraining : [];
        }

      this.form = {
        ...val,
          players: val.players || this.form.players || [],
          scouts: val.scouts || this.form.scouts || [],
          confirmationsTraining: preservedConfirmationsTraining,
          // Usar dados novos se disponíveis, senão preservar existentes apenas se form já inicializado
        teams:
          Array.isArray(val.teams) && val.teams.length > 0
            ? val.teams
              : (isFormInitialized && Array.isArray(existingTeams) && existingTeams.length > 0 ? existingTeams : []),
        fundamentals:
          Array.isArray(val.fundamentals) && val.fundamentals.length > 0
            ? val.fundamentals
              : (isFormInitialized && Array.isArray(existingFundamentals) && existingFundamentals.length > 0 ? existingFundamentals : []),
        specificFundamentals:
          Array.isArray(val.specificFundamentals) &&
          val.specificFundamentals.length > 0
            ? val.specificFundamentals
              : (isFormInitialized && Array.isArray(existingSpecificFundamentals) && existingSpecificFundamentals.length > 0 ? existingSpecificFundamentals : []),
      };
      },
      immediate: false,
    },
    "data.team": function (newVal) {
      if (newVal && (!this.form.teams || this.form.teams.length === 0)) {
        this.form.teams = [{ id: newVal.id, team: newVal.name }];
      }
    },
  },

  methods: {
    // Valida se os campos obrigatórios estão preenchidos
    validateRequiredFields() {
      const requiredFields = {
        name: "Nome do treino",
        description: "Descrição do treino",
        dateValue: "Data do treino",
        timeStartValue: "Horário de início",
        timeEndValue: "Horário de término",
      };

      const missingFields = [];

      for (const [field, label] of Object.entries(requiredFields)) {
        if (
          !this.form[field] ||
          (Array.isArray(this.form[field]) && this.form[field].length === 0)
        ) {
          missingFields.push(label);
        }
      }

      // Validação específica para arrays
      console.log(
        "DEBUG - validateRequiredFields: Teams no form:",
        this.form.teams
      );
      if (!this.form.teams || this.form.teams.length === 0) {
        console.log("DEBUG - validateRequiredFields: Time está vazio!");
        missingFields.push("Time");
      }

      if (missingFields.length > 0) {
        confirmError(
          "Campos obrigatórios não preenchidos!",
          `Por favor, preencha os seguintes campos antes de salvar: ${missingFields.join(
            ", "
          )}`
        );
        return false;
      }

      return true;
    },

    goBack() {
      this.$router.push("/trainings");
    },
    handleNextStep() {
      // Se está tentando ir para as etapas 2 ou 3, valida se o treino está salvo
      if (this.controlledStep === 0 && !this.isTrainingSaved) {
        confirmError(
          "Ação não permitida!",
          "Você precisa salvar as informações básicas do treino antes de acessar as etapas de Chamada e Scouts. Por favor, salve o treino primeiro."
        );
        return;
      }
      if (this.controlledStep < this.steps.length - 1) {
        this.controlledStep = this.controlledStep + 1;
      }
    },
    handlePrevStep() {
      if (this.controlledStep > 0) {
        this.controlledStep = this.controlledStep - 1;
      }
    },

    handleGraphQLError(error) {
      if (
        error.graphQLErrors &&
        error.graphQLErrors[0] &&
        error.graphQLErrors[0].extensions &&
        error.graphQLErrors[0].extensions.validation
      ) {
        const validationErrors = error.graphQLErrors[0].extensions.validation;
        this.$emit("update:errors", validationErrors);

        const errorMessages = Object.values(validationErrors).map((item) => {
          return item[0];
        });

        this.$emit("update:errorFields", Object.keys(validationErrors));

        const footer = errorMessages.join("<br>");

        confirmError("Ocorreu um erro ao executar a operação!", footer);
      } else {
        confirmError("Ocorreu um erro ao executar a operação!");
      }
    },
    errorsDefault() {
      return {
        name: [],
        description: [],
        dateValue: [],
        timeStartValue: [],
        timeEndValue: [],
        teams: [],
        fundamentals: [],
        specificFundamentals: [],
        players: [],
        scouts: [],
      };
    },
    async actionReject(id, playerId, trainingId) {
      try {
        const query = gql`
          ${CONFIRMTRAINING}
        `;

        const variables = {
          id: parseInt(id),
          playerId: parseInt(playerId),
          trainingId: parseInt(trainingId),
          status: "REJECTED",
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        // Atualizar o form.confirmationsTraining localmente
        if (this.form.confirmationsTraining && Array.isArray(this.form.confirmationsTraining)) {
          const confirmationIndex = this.form.confirmationsTraining.findIndex(
            (confirmation) => 
              (confirmation.id && confirmation.id === parseInt(id)) ||
              (confirmation.playerId && confirmation.playerId === parseInt(playerId)) ||
              (confirmation.player?.id && confirmation.player?.id === parseInt(playerId))
          );
          
          if (confirmationIndex !== -1) {
            // Criar novo array para garantir reatividade no Vue 3
            this.form.confirmationsTraining = [
              ...this.form.confirmationsTraining.slice(0, confirmationIndex),
              {
                ...this.form.confirmationsTraining[confirmationIndex],
                status: "REJECTED",
              },
              ...this.form.confirmationsTraining.slice(confirmationIndex + 1),
            ];
          }
        }

        confirmSuccess("Negando intenção de presença com sucesso!", () => {
          this.items = [];
        });

        // Não emitir refresh para evitar recarregar e perder os dados
        // this.$emit("refresh");
      } catch (error) {
        console.error(error);
        this.error = true;

        if (
          error.graphQLErrors &&
          error.graphQLErrors[0] &&
          error.graphQLErrors[0].extensions &&
          error.graphQLErrors[0].extensions.validation
        ) {
          const validationErrors = error.graphQLErrors[0].extensions.validation;
          this.$emit("update:errors", validationErrors);

          const errorMessages = Object.values(validationErrors).map((item) => {
            return item[0];
          });

          this.$emit("update:errorFields", Object.keys(validationErrors));

          const footer = errorMessages.join("<br>");

          confirmError("Ocorreu um erro ao negar a intenção de presença!", footer);
        } else {
          confirmError("Ocorreu um erro ao negar a intenção de presença!");
        }
      }
    },
    async actionConfirmPresence(id, playerId, trainingId, presence) {
      try {
        const query = gql`
          ${CONFIRMPRESENCE}
        `;

        const variables = {
          id: parseInt(id),
          playerId: parseInt(playerId),
          trainingId: parseInt(trainingId),
          presence,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        // Atualizar o form.confirmationsTraining localmente para preservar o valor
        if (this.form.confirmationsTraining && Array.isArray(this.form.confirmationsTraining)) {
          const confirmationIndex = this.form.confirmationsTraining.findIndex(
            (confirmation) => 
              (confirmation.id && confirmation.id === parseInt(id)) ||
              (confirmation.playerId && confirmation.playerId === parseInt(playerId)) ||
              (confirmation.player?.id && confirmation.player?.id === parseInt(playerId))
          );
          
          if (confirmationIndex !== -1) {
            // Criar novo array para garantir reatividade no Vue 3
            this.form.confirmationsTraining = [
              ...this.form.confirmationsTraining.slice(0, confirmationIndex),
              {
                ...this.form.confirmationsTraining[confirmationIndex],
                presence: presence,
              },
              ...this.form.confirmationsTraining.slice(confirmationIndex + 1),
            ];
          }
        }

        confirmSuccess("Presença confirmada com sucesso!", () => {
          this.items = [];
        });

        // Não emitir refresh para evitar recarregar e perder os dados
        // this.$emit("refresh");
      } catch (error) {
        console.error(error);
        this.error = true;

        if (
          error.graphQLErrors &&
          error.graphQLErrors[0] &&
          error.graphQLErrors[0].extensions &&
          error.graphQLErrors[0].extensions.validation
        ) {
          const validationErrors = error.graphQLErrors[0].extensions.validation;
          this.$emit("update:errors", validationErrors);

          const errorMessages = Object.values(validationErrors).map((item) => {
            return item[0];
          });

          this.$emit("update:errorFields", Object.keys(validationErrors));

          const footer = errorMessages.join("<br>");

          confirmError("Ocorreu um erro ao confirmar a presença!", footer);
        } else {
          confirmError("Ocorreu um erro ao confirmar a presença!");
        }
      }
    },
    async actionConfirm(id, playerId, trainingId) {
      try {
        const query = gql`
          ${CONFIRMTRAINING}
        `;

        const variables = {
          id: parseInt(id),
          playerId: parseInt(playerId),
          trainingId: parseInt(trainingId),
          status: "CONFIRMED",
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        // Atualizar o form.confirmationsTraining localmente
        if (this.form.confirmationsTraining && Array.isArray(this.form.confirmationsTraining)) {
          const confirmationIndex = this.form.confirmationsTraining.findIndex(
            (confirmation) => 
              (confirmation.id && confirmation.id === parseInt(id)) ||
              (confirmation.playerId && confirmation.playerId === parseInt(playerId)) ||
              (confirmation.player?.id && confirmation.player?.id === parseInt(playerId))
          );
          
          if (confirmationIndex !== -1) {
            // Criar novo array para garantir reatividade no Vue 3
            this.form.confirmationsTraining = [
              ...this.form.confirmationsTraining.slice(0, confirmationIndex),
              {
                ...this.form.confirmationsTraining[confirmationIndex],
                status: "CONFIRMED",
              },
              ...this.form.confirmationsTraining.slice(confirmationIndex + 1),
            ];
          }
        }

        confirmSuccess("Intenção de presença confirmada com sucesso!", () => {
          this.items = [];
        });

        // Não emitir refresh para evitar recarregar e perder os dados
        // this.$emit("refresh");
      } catch (error) {
        console.error(error);
        this.error = true;

        if (
          error.graphQLErrors &&
          error.graphQLErrors[0] &&
          error.graphQLErrors[0].extensions &&
          error.graphQLErrors[0].extensions.validation
        ) {
          const validationErrors = error.graphQLErrors[0].extensions.validation;
          this.$emit("update:errors", validationErrors);

          const errorMessages = Object.values(validationErrors).map((item) => {
            return item[0];
          });

          this.$emit("update:errorFields", Object.keys(validationErrors));

          const footer = errorMessages.join("<br>");

          confirmError("Ocorreu um erro ao confirmar a intenção de presença!", footer);
        } else {
          confirmError("Ocorreu um erro ao confirmar a intenção de presença!");
        }
      }
    },

    addTeams() {
      // Com return-object, o va-select retorna array de objetos {text, value}
      if (
        !this.teams ||
        (Array.isArray(this.teams) && this.teams.length === 0)
      ) {
        return;
      }

      let teamsToAdd = [];

      if (Array.isArray(this.teams)) {
        // Array de objetos {text, value}
        teamsToAdd = this.teams
          .filter(
            (item) =>
              item && typeof item === "object" && item.value !== undefined
          )
          .map((item) => ({
            id: item.value,
            team: item.text,
          }));
      } else if (
        typeof this.teams === "object" &&
        this.teams.value !== undefined
      ) {
        // Objeto único {text, value} (caso não seja múltiplo)
        teamsToAdd = [
          {
            id: this.teams.value,
            team: this.teams.text,
          },
        ];
      }

      // Adicionar apenas times que ainda não foram adicionados
      teamsToAdd.forEach((newTeam) => {
        const isAlreadyAdded = this.form.teams.some(
          (existingTeam) => existingTeam.id === newTeam.id
        );

        if (!isAlreadyAdded) {
          this.form.teams.push(newTeam);
        }
      });

      this.teams = [];
    },

    addFundamentals() {
      const transformedfundamentals = this.fundamentals.map((item) => {
        return {
          id: item.value,
          fundamental: item.text,
        };
      });

      transformedfundamentals.forEach((newFundamental) => {
        const isAlreadyAdded = this.form.fundamentals.some(
          (existingFundamental) => existingFundamental.id === newFundamental.id
        );

        if (!isAlreadyAdded) {
          this.form.fundamentals.push(newFundamental);
        }
      });

      this.fundamentals = [];
    },

    addSpecificFundamental() {
      const transformedSpecificFundamentals = this.specificFundamentals.map(
        (item) => {
          return {
            id: item.value,
            specificFundamental: item.text,
          };
        }
      );

      transformedSpecificFundamentals.forEach((newSpecificFundamental) => {
        const isAlreadyAdded = this.form.specificFundamentals.some(
          (existingSpecificFundamental) =>
            existingSpecificFundamental.id === newSpecificFundamental.id
        );

        if (!isAlreadyAdded) {
          this.form.specificFundamentals.push(newSpecificFundamental);
        }
      });

      this.specificFundamentals = [];
    },

    actionDeletePosition(id) {
      this.form.positions = this.form.positions.filter((position) => {
        return position.id !== id;
      });

      confirmSuccess("Posição removida com sucesso!");
    },

    actionDeleteTeam(id) {
      this.form.teams = this.form.teams.filter((team) => {
        return team.id !== id;
      });

      confirmSuccess("Time removido com sucesso!");
    },

    actionDeleteFundamental(id) {
      this.form.fundamentals = this.form.fundamentals.filter((fundamental) => {
        return fundamental.id !== id;
      });

      confirmSuccess("Fundamento removido com sucesso!");
    },

    actionDeleteSpecificFundamental(id) {
      this.form.specificFundamentals = this.form.specificFundamentals.filter(
        (specificFundamental) => {
          return specificFundamental.id !== id;
        }
      );

      confirmSuccess("Fundamento Específico removido com sucesso!");
    },

    addPlayers() {
      const transformedPlayers = this.players.map((item) => {
        return {
          id: item.value,
          user: {
            id: item.value,
            name: item.text,
            email: item.email,
            information: item.information,
            positions: item.positions,
          },
        };
      });

      transformedPlayers.forEach((newPlayer) => {
        const isAlreadyAdded = this.form.players.some(
          (existingPlayer) => existingPlayer.id === newPlayer.id
        );

        if (!isAlreadyAdded) {
          this.form.players.push(newPlayer);
        }
      });

      this.players = [];
    },

    addScouts() {
      const transformedScouts = this.scouts.map((item) => {
        return {
          id: item.value,
          name: item.text,
        };
      });

      transformedScouts.forEach((newScout) => {
        const isAlreadyAdded = this.form.scouts.some(
          (existingScout) => existingScout.id === newScout.id
        );

        if (!isAlreadyAdded) {
          this.form.scouts.push(newScout);
        }
      });

      this.scouts = [];
    },

    actionDeletePlayer(id) {
      this.form.players = this.form.players.filter((player) => {
        return player.id !== id;
      });

      confirmSuccess("Jogador removido com sucesso!");
    },

    actionDeleteScout(id) {
      this.form.scouts = this.form.scouts.filter((scout) => {
        return scout.id !== id;
      });

      confirmSuccess("Scout removido com sucesso!");
    },

    messageSpecificFundamental() {
      if (!this.form.fundamentals.length) {
        return "Selecione um Fundamento para habilitar este campo";
      }

      return "";
    },

    async save() {
      if (!this.validateRequiredFields()) {
        return;
      }
      this.$emit("save", this.form);
    },

    async saveAndContinue() {
      if (!this.validateRequiredFields()) {
        return;
      }
        this.$emit("saveAndContinue", this.form);
    },

    // Método específico para salvar scouts sem redirecionamento
    async saveScoutsOnly() {
      console.log("DEBUG - saveScoutsOnly: Iniciando save forçado de scouts");

      try {
        // Forçar o save de todos os scouts pendentes
        if (
          this.$refs.listRelationPlayersWithScoutsRef &&
          this.$refs.listRelationPlayersWithScoutsRef.forceSaveAllScouts
        ) {
          console.log("DEBUG - saveScoutsOnly: Chamando forceSaveAllScouts");
          await this.$refs.listRelationPlayersWithScoutsRef.forceSaveAllScouts();
        } else {
          console.log(
            "DEBUG - saveScoutsOnly: forceSaveAllScouts não disponível"
          );
        }

        // Aguardar um pouco para garantir que o save foi processado
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Emite evento específico para salvar scouts sem redirecionamento
        this.$emit("saveScouts", this.form);
      } catch (error) {
        console.error("DEBUG - saveScoutsOnly: Erro ao salvar scouts:", error);
        // Emite evento mesmo com erro para não bloquear o fluxo
        this.$emit("saveScouts", this.form);
      }
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
}

.form-container-full-width {
  align-items: stretch;
  padding: 0;
  max-width: 100%;
}

.training-form-card {
  width: 100%;
  max-width: 800px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Quando estiver na etapa 3 (scouts), expandir para usar toda a largura */
.training-form-card-full-width {
  max-width: 100% !important;
  width: 100% !important;
  padding: 0 !important;
  box-shadow: none !important;
  background-color: transparent !important;
  border: none !important;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #0b1e3a;
  margin-bottom: 20px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: #0b1e3a;
  margin-top: 24px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
      }

.step-content {
  padding: 20px 0;
}

/* Etapa 3 - Usar toda a largura disponível */
.step-content-full-width {
  padding: 0;
  width: 100%;
  max-width: 100%;
  margin: 0;
}

/* Ajustar o stepper quando estiver na etapa 3 */
.training-form-card-full-width .va-stepper {
  padding: 0 20px;
  margin-bottom: 0;
}

.training-form-card-full-width .va-stepper__content {
  padding: 0;
}

.metrics-section {
  margin-bottom: 32px;
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.progress-bars-section {
  margin-top: 24px;
}

.players-list-section {
  margin-top: 32px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  width: 100%;
  max-width: 800px;
}

.action-buttons va-button {
  border-radius: 8px;
}

.form-container-full-width .action-buttons {
  max-width: 100%;
  padding: 0 20px;
          }

@media (max-width: 768px) {
  .metrics-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 100%;
  }

  .action-buttons va-button {
    width: 100%;
    min-width: auto;
      }
}
</style>
