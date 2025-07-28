<template>
  <va-card class="my-3 mr-3">
    <va-form ref="myForm" class="flex flex-col gap-6 mb-2">
      <va-stepper
        v-model="controlledStep"
        :steps="dynamicSteps"
        controls-hidden
      >
        <template #controls="{ prevStep }">
          <va-button color="primary" @click="prevStep()" v-if="prevStepButton"
            >Anterior</va-button
          >
          <va-button
            color="primary"
            @click="handleNextStep()"
            v-if="nextStepButton"
            >Próximo</va-button
          >
          <va-button color="primary" @click="save()">Salvar</va-button>
          <va-button
            color="success"
            @click="saveAndContinue()"
            v-if="!isTrainingSaved && step <= 3"
            >Salvar e Continuar</va-button
          >
          <va-button
            color="success"
            @click="saveScoutsOnly()"
            v-if="isTrainingSaved && step >= 4"
            >Salvar Scouts</va-button
          >
        </template>
        <template #step-content-0>
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
            id="name"
            v-model="form.description"
            style="width: 100%"
            name="description"
            label="Descrição do Treino"
            class="mb-3"
            :error="errorFields.includes('description')"
            :error-messages="errors.description || []"
          />
        </template>
        <template #step-content-1>
          <div class="mb-5">
            <ZListRelationFundamentals
              :items="form.fundamentals"
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
              :items="form.specificFundamentals"
              @add="addSpecificFundamental"
              @delete="actionDeleteSpecificFundamental"
            >
              <template #filter>
                <ZSelectSpecificFundamental
                  v-model="specificFundamentals"
                  class="mb-3"
                  label="Fundamentos Específicos"
                  :disabled="!form.fundamentals.length"
                  :ignore-ids="form.specificFundamentals.map((item) => item.id)"
                  :fundamentals-ids="form.fundamentals.map((item) => item.id)"
                  :messages="messageSpecificFundamental()"
                />
              </template>
            </ZListRelationSpecificFundamentals>
          </div>
        </template>
        <template #step-content-2>
          <ZListRelationTeams
            :items="form.teams"
            @add="addTeams"
            @delete="actionDeleteTeam"
          >
            <template #filter>
              <ZSelectTeam
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
        </template>
        <template #step-content-3>
          <ZListRelationConfirmationTrainings
            :items="form.confirmationsTraining"
            :training-date="form.dateValue"
            @action-confirm="actionConfirm"
            @action-reject="actionReject"
            @action-confirm-presence="actionConfirmPresence"
          >
            <template #head>
              <div class="row">
                <div class="flex flex-col md6">
                  <div class="item">
                    <ZCardViewMetricsPresenceIntention
                      class="mr-2"
                      title="Métricas do treino, intenção de presença"
                      :strip="false"
                      :data="form.confirmationTrainingMetrics"
                    />
                  </div>
                </div>
                <div class="flex flex-col md6">
                  <div class="item">
                    <ZCardViewMetricsRealPresence
                      title="Métricas do treino, presença real"
                      :strip="false"
                      :data="form.confirmationTrainingMetrics"
                    />
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="flex flex-col md12">
                  <div class="item">
                    <ZProgressBarMetricsTraining
                      :metrics="form.confirmationTrainingMetrics"
                      :data="form"
                    />
                  </div>
                </div>
              </div>
            </template>
          </ZListRelationConfirmationTrainings>
        </template>
        <template #step-content-4>
          <ZListRelationPlayersWithScouts
            :training-id="form.id"
            :items="[...(form.players || []), ...(form.scouts || [])]"
            @add="addPlayers"
            @delete="actionDeletePlayer"
          >
          </ZListRelationPlayersWithScouts>
        </template>
      </va-stepper>
    </va-form>
  </va-card>
</template>

<script>
import { useForm } from "vuestic-ui";
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

const { formData } = useForm("myForm");

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
      formData,
      user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null,
      internalStep: 0, // Propriedade interna controlada
      nextStepButton: true,
      prevStepButton: false,
      yearView: { type: "year" },
      monthView: {
        type: "month",
        year: new Date().getFullYear(),
      },
      steps: [
        { label: "Informações Essenciais" },
        { label: "Fundamentos Treinados" },
        { label: "Time" },
        { label: "Lista de Presença" },
        { label: "Jogadores e Scouts" },
      ],
      positions: [],
      teams: [],
      form: {
        ...this.data,
        players: this.data.players || [],
        scouts: this.data.scouts || [],
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

    // Verifica se pode prosseguir para as etapas 4 e 5
    canProceedToAdvancedSteps() {
      return this.isTrainingSaved;
    },

    // Computed property para controlar o step de forma segura
    controlledStep: {
      get() {
        return this.internalStep;
      },
      set(newStep) {
        console.log(
          "DEBUG - controlledStep: Tentativa de mudança para",
          newStep,
          "atual:",
          this.internalStep
        );

        // BLOQUEIO AGESSIVO: Se estiver nas etapas avançadas (4-5) e tentar ir para etapa 0 ou 3, bloquear
        if (this.internalStep >= 4 && (newStep === 0 || newStep === 3)) {
          console.log(
            "DEBUG - controlledStep: BLOQUEANDO mudança de",
            this.internalStep,
            "para",
            newStep
          );
          return; // Não permite a mudança
        }

        // Se for uma mudança válida, permitir
        console.log("DEBUG - controlledStep: Permitindo mudança para", newStep);
        this.internalStep = newStep;
      },
    },

    // Computed property para acessar o step de forma controlada
    step: {
      get() {
        return this.internalStep;
      },
      set(newStep) {
        console.log(
          "DEBUG - step setter: Tentativa de mudança para",
          newStep,
          "atual:",
          this.internalStep
        );

        // BLOQUEIO AGESSIVO: Se estiver nas etapas avançadas (4-5) e tentar ir para etapa 0 ou 3, bloquear
        if (this.internalStep >= 4 && (newStep === 0 || newStep === 3)) {
          console.log(
            "DEBUG - step setter: BLOQUEANDO mudança de",
            this.internalStep,
            "para",
            newStep
          );
          return; // Não permite a mudança
        }

        // Se for uma mudança válida, permitir
        console.log("DEBUG - step setter: Permitindo mudança para", newStep);
        this.internalStep = newStep;
      },
    },

    // Steps dinâmicos com validação
    dynamicSteps() {
      return [
        { label: "Informações Essenciais" },
        { label: "Fundamentos Treinados" },
        { label: "Time" },
        {
          label: "Lista de Presença",
          disabled: !this.isTrainingSaved,
          tooltip: !this.isTrainingSaved ? "Salve o treino primeiro" : "",
        },
        {
          label: "Jogadores e Scouts",
          disabled: !this.isTrainingSaved,
          tooltip: !this.isTrainingSaved ? "Salve o treino primeiro" : "",
        },
      ];
    },
  },

  watch: {
    internalStep: {
      handler(val, oldVal) {
        if (val !== oldVal) {
          // BLOQUEIO AGESSIVO: Se estiver nas etapas avançadas e tentar ir para 0 ou 3, FORÇA voltar
          if (oldVal >= 4 && (val === 0 || val === 3)) {
            this.$nextTick(() => {
              this.internalStep = oldVal;
            });
            return;
          }
        }

        if (val === 4) {
          this.nextStepButton = false;
        } else {
          this.nextStepButton = true;
        }

        if (val === 0) {
          this.prevStepButton = false;
        } else {
          this.prevStepButton = true;
        }
      },
      immediate: true,
    },
    data(val) {
      const currentStep = this.internalStep;

      // Preservar o step ANTES de atualizar o form
      const stepToPreserve = currentStep;

      this.form = {
        ...val,
        players: val.players || [],
        scouts: val.scouts || [],
      };

      // PRESERVAÇÃO AGESSIVA: Múltiplas tentativas de preservar o step
      const preserveStep = () => {
        if (this.internalStep !== stepToPreserve) {
          this.internalStep = stepToPreserve;
        }
      };

      // Tentativa imediata
      preserveStep();

      // Tentativa no nextTick
      this.$nextTick(preserveStep);

      // Tentativa com setTimeout (última chance)
      setTimeout(preserveStep, 0);
      setTimeout(preserveStep, 10);
      setTimeout(preserveStep, 50);
    },
    "data.team": function (newVal) {
      if (newVal) {
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
      if (!this.form.teams || this.form.teams.length === 0) {
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

    // Valida se pode prosseguir para as etapas 4 e 5
    validateAdvancedStepsAccess() {
      if (!this.canProceedToAdvancedSteps) {
        confirmError(
          "Ação não permitida!",
          "Você precisa salvar as informações básicas do treino antes de acessar as etapas de Lista de Presença e Jogadores/Scouts. Por favor, salve o treino primeiro."
        );
        return false;
      }
      return true;
    },

    // Sobrescreve o método de navegação do stepper para adicionar validação
    handleNextStep() {
      // Se está tentando ir para as etapas 4 ou 5, valida se o treino está salvo
      if (this.step === 2 && !this.validateAdvancedStepsAccess()) {
        return;
      }

      // Se está na etapa 3 e tentando ir para a 4, também valida
      if (this.step === 3 && !this.validateAdvancedStepsAccess()) {
        return;
      }

      // Se passou pela validação, permite a navegação
      this.step++;
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

        confirmError("Ocorreu um erro ao ler todas as notificações!", footer);
      } else {
        confirmError("Ocorreu um erro ao ler todas as notificações!");
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

        confirmSuccess("Negando intenção de presença com sucesso!", () => {
          this.items = [];
        });

        this.$emit("refresh");
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

          confirmError("Ocorreu um erro ao ler todas as notificações!", footer);
        } else {
          confirmError("Ocorreu um erro ao ler todas as notificações!");
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

        confirmSuccess("Presença confirmada com sucesso!", () => {
          this.items = [];
        });

        this.$emit("refresh");
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

          confirmError("Ocorreu um erro ao ler todas as notificações!", footer);
        } else {
          confirmError("Ocorreu um erro ao ler todas as notificações!");
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

        confirmSuccess("Intenção de presença confirmada com sucesso!", () => {
          this.items = [];
        });

        this.$emit("refresh");
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

          confirmError("Ocorreu um erro ao ler todas as notificações!", footer);
        } else {
          confirmError("Ocorreu um erro ao ler todas as notificações!");
        }
      }
    },

    addTeams() {
      const newTeam = {
        id: this.teams.value,
        team: this.teams.text,
      };

      this.form.teams.push(newTeam);

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

      // Só emite o evento saveAndContinue se estiver nas etapas iniciais (0-3)
      // Para evitar redirecionamentos quando estiver salvando scouts na etapa 4-5
      if (this.step <= 3) {
        this.$emit("saveAndContinue", this.form);
      } else {
        // Se estiver nas etapas 4-5, usa o método específico para scouts
        this.$emit("saveScouts", this.form);
      }
    },

    // Método específico para salvar scouts sem redirecionamento
    async saveScoutsOnly() {
      // Emite evento específico para salvar scouts sem redirecionamento
      this.$emit("saveScouts", this.form);
    },
  },
};
</script>
