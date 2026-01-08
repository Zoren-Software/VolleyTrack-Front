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
                    :ignore-ids="form.teams.map((item) => parseInt(item.id))"
                    :messages="
                      form.teams.length >= 1 ? 'Você já selecionou um time' : ''
                    "
                  />
                </template>
              </ZListRelationTeams>

              <!-- Mostrar jogadores do time após relacionar (apenas visualização) -->
              <div
                v-if="
                  form.teams &&
                  form.teams.length > 0 &&
                  getTeamPlayers().length > 0
                "
                class="mt-5"
              >
                <h3 class="subsection-title">Jogadores Relacionados</h3>
                <div class="players-list-simple">
                  <div
                    v-for="confirmation in getTeamPlayers()"
                    :key="confirmation.player?.id || confirmation.playerId"
                    class="player-item-simple"
                  >
                    <ZUser :data="confirmation.player" />
                    <div class="player-positions">
                      <span
                        v-for="(position, index) in confirmation.player
                          ?.positions || []"
                        :key="position?.id || index"
                        class="position-tag"
                      >
                        {{ position?.name }}
                      </span>
                      <span
                        v-if="
                          !confirmation.player?.positions ||
                          confirmation.player?.positions.length === 0
                        "
                        class="no-positions"
                      >
                        Sem posições
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Adicionar jogadores avulsos (apenas na tela de edição) -->
              <div v-if="isTrainingSaved" class="mt-5">
                <h3 class="subsection-title">Jogadores Avulsos</h3>
                <p class="subsection-description mb-3">
                  Adicione jogadores que não fazem parte do time relacionado
                </p>
                <div class="standalone-players-section">
                  <ZSelectUser
                    v-model="standalonePlayers"
                    :ignoreIds="getAllPlayerIds()"
                    :rolesIds="[3]"
                    class="mb-3"
                    label="Buscar e selecionar jogadores avulsos"
                    placeholder="Digite o nome do jogador"
                  />
                  <va-button
                    color="primary"
                    icon="add"
                    @click="addStandalonePlayers"
                    class="mb-3"
                  >
                    Adicionar Jogador Avulso
                  </va-button>
                </div>

                <!-- Mostrar jogadores avulsos adicionados (apenas visualização) -->
                <div v-if="getStandalonePlayers().length > 0" class="mt-4">
                  <h4 class="subsection-subtitle mb-3">
                    Jogadores Avulsos Adicionados
                  </h4>
                  <div class="players-list-simple">
                    <div
                      v-for="confirmation in getStandalonePlayers()"
                      :key="confirmation.player?.id || confirmation.playerId"
                      class="player-item-simple"
                    >
                      <ZUser :data="confirmation.player" />
                      <div class="player-positions">
                        <span
                          v-for="(position, index) in confirmation.player
                            ?.positions || []"
                          :key="position?.id || index"
                          class="position-tag"
                        >
                          {{ position?.name }}
                        </span>
                        <span
                          v-if="
                            !confirmation.player?.positions ||
                            confirmation.player?.positions.length === 0
                          "
                          class="no-positions"
                        >
                          Sem posições
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import TEAM from "~/graphql/team/query/team.graphql";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import TRAININGEDIT from "~/graphql/training/mutation/trainingEdit.graphql";
import TRAINING from "~/graphql/training/query/training.graphql";
import moment from "moment";

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
    ZSelectUser,
    ZUser,
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
      radioOptions: [
        { label: 'Alterar apenas este treino', value: false },
        { label: 'Alterar este treino e todos os futuros', value: true },
      ],
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
        confirmationTrainingMetrics:
          this.data.confirmationTrainingMetrics || {},
        standalonePlayerIds: [],
      },
      fundamentals: [],
      specificFundamentals: [],
      users: [],
      players: [],
      scouts: [],
      standalonePlayers: [],
      teamPlayersCache: {}, // Cache para armazenar jogadores dos times
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

      const confirmed = confirmations.filter(
        (c) => c.status === "CONFIRMED" || c.status === "confirmed"
      ).length;
      const pending = confirmations.filter(
        (c) => c.status === "PENDING" || c.status === "pending"
      ).length;
      const rejected = confirmations.filter(
        (c) => c.status === "REJECTED" || c.status === "rejected"
      ).length;
      const presence = confirmations.filter((c) => c.presence === true).length;
      const absence = confirmations.filter((c) => c.presence === false).length;

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
        const existingTeams = isFormInitialized ? this.form.teams || [] : [];
        const existingFundamentals = isFormInitialized
          ? this.form.fundamentals || []
          : [];
        const existingSpecificFundamentals = isFormInitialized
          ? this.form.specificFundamentals || []
          : [];
        const existingConfirmationsTraining = isFormInitialized
          ? this.form.confirmationsTraining || []
          : [];

        // Preservar valores de presença real e status dos confirmationsTraining existentes
        let preservedConfirmationsTraining;

        if (
          val.confirmationsTraining &&
          val.confirmationsTraining.length > 0 &&
          isFormInitialized
        ) {
          // Se há novos dados e o form já foi inicializado, mesclar preservando valores de presença e status
          preservedConfirmationsTraining = val.confirmationsTraining.map(
            (newConfirmation) => {
              // Buscar confirmação existente com mesmo ID ou mesmo playerId
              const existingConfirmation = existingConfirmationsTraining.find(
                (existing) =>
                  (existing.id && existing.id === newConfirmation.id) ||
                  (existing.playerId &&
                    existing.playerId === newConfirmation.playerId) ||
                  (existing.player?.id &&
                    existing.player?.id === newConfirmation.player?.id)
              );

              if (existingConfirmation) {
                // Preservar presença se foi marcada (true ou false)
                const preservedPresence =
                  existingConfirmation.presence !== null &&
                  existingConfirmation.presence !== undefined
                    ? existingConfirmation.presence
                    : newConfirmation.presence;

                // Preservar status se foi alterado (não é PENDING)
                const preservedStatus =
                  existingConfirmation.status &&
                  existingConfirmation.status !== "PENDING" &&
                  existingConfirmation.status !== "pending"
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
            }
          );
        } else if (
          val.confirmationsTraining &&
          val.confirmationsTraining.length > 0
        ) {
          // Se é a primeira vez carregando, usar os dados novos diretamente
          preservedConfirmationsTraining = val.confirmationsTraining;
        } else {
          // Se não há novos dados, manter os existentes apenas se já houver dados no form
          preservedConfirmationsTraining = isFormInitialized
            ? existingConfirmationsTraining
            : [];
        }

        this.form = {
          ...val,
          players: val.players || this.form.players || [],
          scouts: val.scouts || this.form.scouts || [],
          confirmationsTraining: preservedConfirmationsTraining,
          standalonePlayerIds: this.form.standalonePlayerIds || [],
          // Usar dados novos se disponíveis, senão preservar existentes apenas se form já inicializado
          teams:
            Array.isArray(val.teams) && val.teams.length > 0
              ? val.teams
              : isFormInitialized &&
                Array.isArray(existingTeams) &&
                existingTeams.length > 0
              ? existingTeams
              : [],
          fundamentals:
            Array.isArray(val.fundamentals) && val.fundamentals.length > 0
              ? val.fundamentals
              : isFormInitialized &&
                Array.isArray(existingFundamentals) &&
                existingFundamentals.length > 0
              ? existingFundamentals
              : [],
          specificFundamentals:
            Array.isArray(val.specificFundamentals) &&
            val.specificFundamentals.length > 0
              ? val.specificFundamentals
              : isFormInitialized &&
                Array.isArray(existingSpecificFundamentals) &&
                existingSpecificFundamentals.length > 0
              ? existingSpecificFundamentals
              : [],
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
        if (
          this.form.confirmationsTraining &&
          Array.isArray(this.form.confirmationsTraining)
        ) {
          const confirmationIndex = this.form.confirmationsTraining.findIndex(
            (confirmation) =>
              (confirmation.id && confirmation.id === parseInt(id)) ||
              (confirmation.playerId &&
                confirmation.playerId === parseInt(playerId)) ||
              (confirmation.player?.id &&
                confirmation.player?.id === parseInt(playerId))
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

          confirmError(
            "Ocorreu um erro ao negar a intenção de presença!",
            footer
          );
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
        if (
          this.form.confirmationsTraining &&
          Array.isArray(this.form.confirmationsTraining)
        ) {
          const confirmationIndex = this.form.confirmationsTraining.findIndex(
            (confirmation) =>
              (confirmation.id && confirmation.id === parseInt(id)) ||
              (confirmation.playerId &&
                confirmation.playerId === parseInt(playerId)) ||
              (confirmation.player?.id &&
                confirmation.player?.id === parseInt(playerId))
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
        if (
          this.form.confirmationsTraining &&
          Array.isArray(this.form.confirmationsTraining)
        ) {
          const confirmationIndex = this.form.confirmationsTraining.findIndex(
            (confirmation) =>
              (confirmation.id && confirmation.id === parseInt(id)) ||
              (confirmation.playerId &&
                confirmation.playerId === parseInt(playerId)) ||
              (confirmation.player?.id &&
                confirmation.player?.id === parseInt(playerId))
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

          confirmError(
            "Ocorreu um erro ao confirmar a intenção de presença!",
            footer
          );
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

          // Buscar jogadores do time e adicionar à lista
          this.loadTeamPlayers(newTeam.id);
        }
      });

      // Limpar seleção após adicionar
      this.teams = [];
    },

    loadTeamPlayers(teamId) {
      try {
        // Verificar se já temos os jogadores em cache
        if (this.teamPlayersCache[teamId]) {
          this.addTeamPlayersToConfirmations(
            this.teamPlayersCache[teamId],
            teamId
          );
          return;
        }

        // Buscar jogadores do time
        const query = gql`
          ${TEAM}
        `;

        const {
          result: { value },
        } = useQuery(query, { id: teamId });

        const { onResult } = useQuery(query, { id: teamId });

        onResult((result) => {
          if (result?.data?.team?.players) {
            // Armazenar em cache
            this.teamPlayersCache[teamId] = result.data.team.players;
            // Adicionar jogadores à lista de confirmações
            this.addTeamPlayersToConfirmations(
              result.data.team.players,
              teamId
            );
          }
        });

        // Também verificar se já temos resultado imediato
        if (value?.team?.players) {
          this.teamPlayersCache[teamId] = value.team.players;
          this.addTeamPlayersToConfirmations(value.team.players, teamId);
        }
      } catch (error) {
        console.error("Erro ao carregar jogadores do time:", error);
      }
    },

    addTeamPlayersToConfirmations(players, teamId) {
      if (!players || !Array.isArray(players)) {
        return;
      }

      if (!this.form.confirmationsTraining) {
        this.form.confirmationsTraining = [];
      }

      players.forEach((player) => {
        // Verificar se o jogador já existe na lista (por ID do jogador)
        const alreadyExists = this.form.confirmationsTraining.some(
          (confirmation) =>
            confirmation.player?.id === player.id &&
            confirmation.teamId === teamId
        );

        if (!alreadyExists) {
          // Criar objeto temporário de confirmação para exibir
          this.form.confirmationsTraining.push({
            id: null, // Será criado quando salvar
            playerId: player.id,
            player: {
              id: player.id,
              name: player.name,
              email: player.email,
              userId: player.userId,
              information: player.information || null,
              positions: player.positions || [],
              teams: player.teams || [],
              emailVerifiedAt: player.emailVerifiedAt,
              createdAt: player.createdAt,
              updatedAt: player.updatedAt,
            },
            trainingId: this.form.id || null,
            teamId: teamId,
            status: "PENDING",
            presence: null,
            createdAt: null,
            updatedAt: null,
          });
        }
      });
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

    getAllPlayerIds() {
      const teamPlayerIds =
        this.form.confirmationsTraining
          ?.filter((ct) => ct.player?.id)
          .map((ct) => parseInt(ct.player.id))
          .filter((id) => !isNaN(id)) || [];
      return teamPlayerIds;
    },

    getTeamPlayers() {
      if (
        !this.form.teams ||
        this.form.teams.length === 0 ||
        !this.form.confirmationsTraining
      ) {
        return [];
      }

      const teamIds = this.form.teams.map((t) => parseInt(t.id));
      return this.form.confirmationsTraining.filter(
        (ct) => ct.teamId && teamIds.includes(parseInt(ct.teamId))
      );
    },

    getStandalonePlayers() {
      if (!this.form.confirmationsTraining) {
        return [];
      }
      return this.form.confirmationsTraining.filter((ct) => !ct.teamId);
    },

    async addStandalonePlayers() {
      console.log("addStandalonePlayers chamado", this.standalonePlayers);

      if (
        !this.standalonePlayers ||
        (Array.isArray(this.standalonePlayers) &&
          this.standalonePlayers.length === 0) ||
        (typeof this.standalonePlayers === "object" &&
          !Array.isArray(this.standalonePlayers) &&
          !this.standalonePlayers.value &&
          !this.standalonePlayers.id)
      ) {
        confirmError("Por favor, selecione um jogador antes de adicionar.");
        return;
      }

      if (!this.form.id) {
        confirmError(
          "O treino precisa ser salvo antes de adicionar jogadores avulsos."
        );
        return;
      }

      let playersToAdd = [];

      if (Array.isArray(this.standalonePlayers)) {
        playersToAdd = this.standalonePlayers
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              (item.value !== undefined || item.id !== undefined)
          )
          .map((item) => ({
            id: parseInt(item.value || item.id),
            name: item.text || item.name,
            email: item.email || null,
            information: item.information || null,
            positions: item.positions || [],
          }))
          .filter((item) => !isNaN(item.id) && item.id > 0);
      } else if (
        typeof this.standalonePlayers === "object" &&
        this.standalonePlayers !== null
      ) {
        const playerId = parseInt(
          this.standalonePlayers.value || this.standalonePlayers.id || 0
        );

        if (!isNaN(playerId) && playerId > 0) {
          playersToAdd = [
            {
              id: playerId,
              name: this.standalonePlayers.text || this.standalonePlayers.name,
              email: this.standalonePlayers.email || null,
              information: this.standalonePlayers.information || null,
              positions: this.standalonePlayers.positions || [],
            },
          ];
        }
      }

      if (playersToAdd.length === 0) {
        confirmError("Nenhum jogador válido foi encontrado na seleção.");
        return;
      }

      // Verificar quais jogadores já foram adicionados
      const existingPlayerIds =
        this.form.confirmationsTraining
          ?.map((ct) => parseInt(ct.player?.id || ct.playerId || 0))
          .filter((id) => !isNaN(id) && id > 0) || [];

      const newPlayerIds = playersToAdd
        .map((p) => p.id)
        .filter((id) => !existingPlayerIds.includes(id));

      if (newPlayerIds.length === 0) {
        confirmError(
          "Todos os jogadores selecionados já foram adicionados anteriormente."
        );
        return;
      }

      try {
        // Preparar dados para a mutation
        const dateStart =
          moment(this.form.dateValue).format("YYYY-MM-DD") +
          " " +
          moment(this.form.timeStartValue).format("HH:mm:ss");
        const dateEnd =
          moment(this.form.dateValue).format("YYYY-MM-DD") +
          " " +
          moment(this.form.timeEndValue).format("HH:mm:ss");

        // Obter todos os playerIds já existentes + os novos
        const allStandalonePlayerIds = [
          ...(this.form.standalonePlayerIds || []),
          ...newPlayerIds,
        ];

        const query = gql`
          mutation trainingEdit(
            $id: ID!
            $teamId: Int
            $fundamentalId: [Int]
            $specificFundamentalId: [Int]
            $playerIds: [Int]
            $name: String!
            $description: String
            $dateStart: String!
            $dateEnd: String!
          ) {
            trainingEdit(
              id: $id
              teamId: $teamId
              fundamentalId: $fundamentalId
              specificFundamentalId: $specificFundamentalId
              playerIds: $playerIds
              name: $name
              description: $description
              dateStart: $dateStart
              dateEnd: $dateEnd
            ) {
              id
              confirmationsTraining {
                id
                userId
                playerId
                trainingId
                status
                presence
                teamId
                player {
                  id
                  name
                  email
                  userId
                  information {
                    id
                    userId
                    cpf
                    rg
                    phone
                    birthDate
                    createdAt
                    updatedAt
                  }
                  teams {
                    id
                    name
                    userId
                    createdAt
                    updatedAt
                  }
                  positions {
                    id
                    name
                    userId
                    createdAt
                    updatedAt
                  }
                  emailVerifiedAt
                  createdAt
                  updatedAt
                }
                createdAt
                updatedAt
              }
            }
          }
        `;

        // Quando estamos apenas adicionando jogadores avulsos, não precisamos
        // enviar fundamentos, pois o backend já os tem salvos.
        // Isso evita erros de validação.
        const variables = {
          id: parseInt(this.form.id),
          name: this.form.name,
          description: this.form.description || null,
          teamId:
            this.form.teams && this.form.teams.length > 0
              ? parseInt(this.form.teams[0].id)
              : null,
          // Não enviar fundamentos ao adicionar apenas jogadores
          // O backend preservará os fundamentos existentes
          playerIds: allStandalonePlayerIds,
          dateStart,
          dateEnd,
        };

        const { mutate } = await useMutation(query, { variables });
        const { data } = await mutate();

        // Atualizar a lista de confirmações com os dados retornados
        if (data?.trainingEdit?.confirmationsTraining) {
          // Filtrar apenas os jogadores avulsos (sem teamId) retornados
          const standaloneConfirmations =
            data.trainingEdit.confirmationsTraining.filter(
              (ct) => !ct.teamId || ct.teamId === null
            );

          // Atualizar a lista local: manter jogadores do time e atualizar jogadores avulsos
          if (!this.form.confirmationsTraining) {
            this.form.confirmationsTraining = [];
          }

          // Separar jogadores do time e jogadores avulsos
          const teamPlayers = this.form.confirmationsTraining.filter(
            (ct) => ct.teamId && ct.teamId !== null
          );

          // Combinar jogadores do time com os jogadores avulsos retornados
          this.form.confirmationsTraining = [
            ...teamPlayers,
            ...standaloneConfirmations,
          ];

          // Atualizar standalonePlayerIds
          this.form.standalonePlayerIds = allStandalonePlayerIds;

          // Forçar reatividade do Vue
          this.$forceUpdate();
        }

        this.standalonePlayers = [];

        confirmSuccess(
          `${newPlayerIds.length} jogador(es) avulso(s) adicionado(s) com sucesso!`
        );

        // Emitir refresh para atualizar os dados
        this.$emit("refresh");
      } catch (error) {
        console.error("Erro ao adicionar jogadores avulsos:", error);
        confirmError(
          "Ocorreu um erro ao adicionar os jogadores avulsos. Tente novamente."
        );
      }
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

.subsection-description {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 12px;
}

.standalone-players-section {
  margin-bottom: 20px;
}

.players-list-simple {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.player-item-simple {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.player-positions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.player-item-simple .position-tag {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
  background-color: #e9742b;
  color: white;
  line-height: 1.3;
}

.player-item-simple .no-positions {
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
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

.bulk-edit-option {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.bulk-edit-title {
  font-size: 16px;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-edit-title::before {
  content: "";
  width: 4px;
  height: 20px;
  background: #e9742b;
  border-radius: 2px;
}

.bulk-edit-radios-container {
  margin-bottom: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
  cursor: pointer;
  user-select: none;
}

.radio-option-label:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.radio-input-native {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #e9742b;
  flex-shrink: 0;
}

.radio-label-text {
  font-size: 14px;
  color: #0c4a6e;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
}

.bulk-edit-hint {
  font-size: 13px;
  color: #075985;
  margin: 12px 0 0 0;
  line-height: 1.6;
  padding-top: 12px;
  border-top: 1px solid rgba(186, 230, 253, 0.5);
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
