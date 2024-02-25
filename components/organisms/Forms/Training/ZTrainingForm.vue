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
            v-model="form.name"
            name="name"
            label="Nome"
            id="name"
            class="mb-3"
            :error-messages="errors.name || []"
          />
          <ZDateTimeRangePicker
            :date="form.dateValue"
            :timeStart="form.timeStartValue"
            :timeEnd="form.timeEndValue"
            @update:date="form.dateValue = $event"
            @update:timeStart="form.timeStartValue = $event"
            @update:timeEnd="form.timeEndValue = $event"
            id="dateTimeRange"
            label="Data Inicio"
            clearable
          />
          <VaTextarea
            style="width: 100%"
            v-model="form.description"
            name="description"
            label="Descrição do Treino"
            id="name"
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
                  class="mb-3"
                  label="Fundamentos"
                  v-model="fundamentals"
                  :ignoreIds="form.fundamentals.map((item) => item.id)"
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
                  class="mb-3"
                  label="Fundamentos Específicos"
                  :disabled="!form.fundamentals.length"
                  v-model="specificFundamentals"
                  :ignoreIds="form.specificFundamentals.map((item) => item.id)"
                  :fundamentalsIds="form.fundamentals.map((item) => item.id)"
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
                class="mb-3"
                label="Times"
                :disabled="form.teams.length >= 1"
                v-model="teams"
                :ignoreIds="form.teams.map((item) => item.id)"
                :messages="
                  form.teams.length >= 1 ? 'Você já selecionou um time' : ''
                "
              />
            </template>
          </ZListRelationTeams>
        </template>
        <template #step-content-3>
          <ZListRelationConfirmationTrainings
            @actionConfirm="actionConfirm"
            @actionReject="actionReject"
            @actionConfirmPresence="actionConfirmPresence"
            :items="form.confirmationsTraining"
            :trainingDate="form.dateValue"
          >
            <template #filter>
              <ZSelectUser class="mb-3" label="Jogadores" v-model="users" />
            </template>
          </ZListRelationConfirmationTrainings>
        </template>
      </va-stepper>
    </va-form>
  </va-card>
</template>

<script>
import { useForm } from "vuestic-ui";
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZDate from "~/components/atoms/Inputs/ZDate";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZListRelationFundamentals from "~/components/organisms/List/Relations/ZListRelationFundamentals";
import ZListRelationSpecificFundamentals from "~/components/organisms/List/Relations/ZListRelationSpecificFundamentals";
import ZListRelationTeams from "~/components/organisms/List/Relations/ZListRelationTeams";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
import ZDateTimeRangePicker from "~/components/molecules/Inputs/ZDateTimeRangePicker.vue";
import ZSelectFundamental from "~/components/molecules/Selects/ZSelectFundamental.vue";
import ZSelectSpecificFundamental from "~/components/molecules/Selects/ZSelectSpecificFundamental.vue";
import ZListRelationConfirmationTrainings from "~/components/organisms/List/Relations/ZListRelationConfirmationTrainings";
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
    ZDate,
    ZSelectTeam,
    ZListRelationFundamentals,
    ZListRelationSpecificFundamentals,
    ZListRelationTeams,
    ZDateTimeRangePicker,
    ZSelectFundamental,
    ZSelectSpecificFundamental,
    ZListRelationConfirmationTrainings,
    ZSelectUser,
  },

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
      ],
      positions: [],
      teams: [],
      form: {
        ...this.data,
      },
      fundamentals: [],
      specificFundamentals: [],
      users: [],
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
      this.form = { ...val };
    },
  },

  methods: {
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
      };
    },

    actionConfirm(id) {
      //TODO - Fazendo essas funções de ações
      console.log(id);
    },
    actionReject(id) {
      //TODO - Fazendo essas funções de ações
      console.log(id);
    },
    actionConfirmPresence(id) {
      //TODO - Fazendo essas funções de ações
      console.log(id);
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
