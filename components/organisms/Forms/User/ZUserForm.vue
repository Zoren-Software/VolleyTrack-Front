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
          />
          <ZEmailInput
            v-model="form.email"
            label="E-mail"
            id="email"
            class="mb-3"
          />
          <ZPasswordInputWithConfirmPassword
            v-model="form.password"
            confirmPasswordInput
            name="password"
            passwordLabel="Senha Provisória"
            :passwordMessages="passwordMessages"
            id="password"
            class="mb-3"
          />
        </template>
        <template #step-content-1>
          <ZCPFInput v-model="form.cpf" />
          <ZRGInput v-model="form.rg" />
        </template>
        <template #step-content-2>
          <ZSelectRole
            class="mb-3"
            label="Permissões"
            v-model="form.permission"
            :ignoreIds="form.permission.map((item) => item.id)"
          />
        </template>
        <template #step-content-3>
          <ZListRelationPositions
            :items="form.positions"
            @add="addPositions"
            @delete="actionDeletePosition"
          >
            <template #filter>
              <ZSelectPosition
                class="mb-3"
                label="Posições"
                v-model="positions"
                :ignoreIds="form.positions.map((item) => item.id)"
              />
            </template>
          </ZListRelationPositions>
        </template>
        <template #step-content-4>
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
    <pre
      >{{ form }}
    </pre>
  </va-card>
</template>

<script>
import { useForm } from "vuestic-ui";
import ZPasswordInputWithConfirmPassword from "~/components/molecules/Inputs/ZPasswordInputWithConfirmPassword";
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZInput from "~/components/atoms/Inputs/ZInput";
import ZEmailInput from "~/components/molecules/Inputs/ZEmailInput";
import ZCPFInput from "~/components/molecules/Inputs/ZCPFInput";
import ZRGInput from "~/components/molecules/Inputs/ZRGInput";
import ZSelectRole from "~/components/molecules/Selects/ZSelectRole";
import ZSelectPosition from "~/components/molecules/Selects/ZSelectPosition";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZListRelationPositions from "~/components/organisms/List/Relations/ZListRelationPositions";
import ZListRelationTeams from "~/components/organisms/List/Relations/ZListRelationTeams";
import Swal from "sweetalert2";

const { formData } = useForm("myForm");

export default {
  components: {
    ZPasswordInputWithConfirmPassword,
    ZEmailInput,
    ZTextInput,
    ZInput,
    ZCPFInput,
    ZRGInput,
    ZSelectRole,
    ZSelectPosition,
    ZSelectTeam,
    ZListRelationPositions,
    ZListRelationTeams,
  },
  data() {
    return {
      formData,
      step: 0,
      nextStepButton: true,
      prevStepButton: false,
      passwordMessages: [
        "No primeiro login do usuário ele deverá alterar a senha.",
      ],
      steps: [
        { label: "Informações Essenciais" },
        { label: "Informações Pessoais" },
        { label: "Permissão" },
        { label: "Posição" },
        { label: "Times" },
      ],
      form: {
        name: "",
        email: "",
        password: "",
        cpf: "",
        permission: [],
        positions: [],
        teams: [],
      },
      positions: [],
      teams: [],
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
  },

  methods: {
    addPositions() {
      const transformedPositions = this.positions.map((item) => {
        return {
          id: item.value,
          position: item.text,
        };
      });

      transformedPositions.forEach((newPosition) => {
        const isAlreadyAdded = this.form.positions.some(
          (existingPosition) => existingPosition.id === newPosition.id
        );

        if (!isAlreadyAdded) {
          this.form.positions.push(newPosition);
        }
      });

      this.positions = [];
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

      Swal.fire({
        icon: "success",
        title: "Posição removida com sucesso!",
        showConfirmButton: true,
        confirmButtonColor: "#154EC1",
      });
    },

    actionDeleteTeam(id) {
      this.form.teams = this.form.teams.filter((team) => {
        return team.id !== id;
      });

      Swal.fire({
        icon: "success",
        title: "Time removido com sucesso!",
        showConfirmButton: true,
        confirmButtonColor: "#154EC1",
      });
    },
    save() {
      //TODO - Fazer a requisição para salvar o usuário
      console.log(this.form);
    },
  },
};
</script>
