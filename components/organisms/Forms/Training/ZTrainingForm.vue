<template>
  <va-card class="my-3 mr-3">
    <va-form ref="myForm" class="flex flex-col gap-6 mb-2">
      <va-stepper v-model="step" :steps="steps" controls-hidden>
        <template #controls="{ nextStep, prevStep }">
          <va-button color="primary" @click="prevStep()" v-if="prevStepButton"
            >Anterior</va-button
          >
          <va-button color="primary" @click="nextStep()" v-if="nextStepButton"
            >Próximo</va-button
          >
          <va-button color="primary" @click="save()">Salvar</va-button>
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
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";

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
    ZSelectUser,
  },

  emits: ["refresh", "update:errors", "update:errorFields"],

  data() {
    return {
      formData,
      user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null,
      step: 0,
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

  watch: {
    step(val) {
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
    data(val) {
      this.form = {
        ...val,
        players: val.players || [],
        scouts: val.scouts || [],
      };
    },
    "data.team": function (newVal) {
      if (newVal) {
        this.form.teams = [{ id: newVal.id, team: newVal.name }];
      }
    },
  },

  methods: {
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
          this.errors = error.graphQLErrors[0].extensions.validation;

          const errorMessages = Object.values(this.errors).map((item) => {
            return item[0];
          });

          this.errorFields = Object.keys(this.errors);

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
          this.errors = error.graphQLErrors[0].extensions.validation;

          const errorMessages = Object.values(this.errors).map((item) => {
            return item[0];
          });

          this.errorFields = Object.keys(this.errors);

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
          this.errors = error.graphQLErrors[0].extensions.validation;

          const errorMessages = Object.values(this.errors).map((item) => {
            return item[0];
          });

          this.errorFields = Object.keys(this.errors);

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
      this.$emit("save", this.form);
    },
  },
};
</script>
