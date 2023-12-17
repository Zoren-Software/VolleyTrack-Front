<template>
  <va-card class="my-3 mr-3">
    <va-form ref="myForm" class="flex flex-col gap-6 mb-2">
      <pre>
        {{ form }}
      </pre>
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
            :error="errorFields.includes('name')"
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
          <ZDate
            v-model="form.birthDate"
            id="birthDate"
            label="Data de Nascimento"
            v-model:view="yearView"
            clearable
          />
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
                v-model="teams"
                :ignoreIds="form.teams.map((item) => item.id)"
              />
            </template>
          </ZListRelationTeams>
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
import ZListRelationPositions from "~/components/organisms/List/Relations/ZListRelationPositions";
import ZListRelationTeams from "~/components/organisms/List/Relations/ZListRelationTeams";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
import ZDateTimeRangePicker from "~/components/molecules/Inputs/ZDateTimeRangePicker.vue";

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
        };
      },
    },
  },
  components: {
    ZTextInput,
    ZDate,
    ZSelectTeam,
    ZListRelationPositions,
    ZListRelationTeams,
    ZDateTimeRangePicker,
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
        { label: "Times" },
      ],
      positions: [],
      teams: [],
      form: {
        ...this.data,
      },
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
      this.form = { ...val, birthDate: val.information.birthDate };
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
      };
    },

    addTeams() {
      const transformedteams = this.teams.map((item) => {
        return {
          id: item.value,
          team: item.text,
        };
      });

      transformedteams.forEach((newTeam) => {
        const isAlreadyAdded = this.form.teams.some(
          (existingTeam) => existingTeam.id === newTeam.id
        );

        if (!isAlreadyAdded) {
          this.form.teams.push(newTeam);
        }
      });

      this.teams = [];
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
    async save() {
      this.$emit("save", this.form);
    },
  },
};
</script>
