<template>
  <va-card class="my-3 mr-3">
    <va-form ref="myForm" class="flex flex-col gap-6 mb-2">
      <va-stepper v-model="step" :steps="steps" controls-hidden>
        <template #controls="{ nextStep, prevStep }">
          <va-button v-if="prevStepButton" color="primary" @click="prevStep()">
            Anterior
          </va-button>
          <va-button
            v-if="nextStepButton"
            color="primary"
            :disabled="step === 1"
            @click="nextStep()"
          >
            Próximo
          </va-button>
          <va-button
            v-if="step === 1"
            color="primary"
            :disabled="!nextStepButton"
            @click="save()"
          >
            Salvar
          </va-button>
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
          <ZSelectTeamCategory
            v-model="form.teamCategory"
            name="teamCategoryId"
            label="Categoria"
            class="mb-3"
            :error-messages="errors.teamCategory || []"
          />
          <ZSelectTeamLevel
            v-model="form.teamLevel"
            name="teamLevelId"
            label="Nível"
            class="mb-3"
            :error-messages="errors.teamLevel || []"
          />
        </template>
        <template #step-content-1>
          <ZListRelationUsers
            :items="form.users"
            @add="addUsers"
            @delete="actionDeleteUser"
          >
            <template #filter>
              <ZSelectUser
                v-model="users"
                :ignoreIds="form.users.map((item) => item.id)"
                class="mb-3"
                label="Jogadores"
              />
            </template>
          </ZListRelationUsers>
        </template>
      </va-stepper>
    </va-form>
  </va-card>
</template>

<script>
import { useForm } from "vuestic-ui";
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import ZListRelationUsers from "~/components/organisms/List/Relations/ZListRelationUsers";
import ZSelectTeamCategory from "~/components/molecules/Selects/ZSelectTeamCategory";
import ZSelectTeamLevel from "~/components/molecules/Selects/ZSelectTeamLevel.vue";
import { confirmSuccess } from "~/utils/sweetAlert2/swalHelper";

const { formData } = useForm("myForm");

export default {
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          name: "",
          users: [],
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
          users: [],
        };
      },
    },
  },
  components: {
    ZTextInput,
    ZSelectUser,
    ZListRelationUsers,
    ZSelectTeamCategory,
    ZSelectTeamLevel,
  },

  data() {
    return {
      formData,
      step: 0,
      nextStepButton: true,
      prevStepButton: false,
      yearView: { type: "year" },
      monthView: {
        type: "month",
        year: new Date().getFullYear(),
      },
      steps: [{ label: "Informações Essenciais" }, { label: "Jogadores" }],
      users: [],
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
      this.form = { ...val };
    },
  },

  methods: {
    errorsDefault() {
      return {
        name: [],
        users: [],
      };
    },

    addUsers() {
      const transformedUser = this.users.map((item) => {
        return {
          id: item.value,
          user: item,
        };
      });

      transformedUser.forEach((newTeam) => {
        const isAlreadyAdded = this.form.users.some(
          (existingTeam) => existingTeam.id === newTeam.id
        );

        if (!isAlreadyAdded) {
          this.form.users.push(newTeam);
        }
      });

      this.users = [];
    },

    actionDeleteUser(id) {
      this.form.users = this.form.users.filter((user) => {
        return user.id !== id;
      });

      confirmSuccess("Jogador removido com sucesso!");
    },

    async save() {
      console.log(this.form);
      this.$emit("save", this.form);
    },
  },
};
</script>
