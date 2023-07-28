<template>
  <va-card class="my-3 mr-3">
    <va-form ref="myForm" class="flex flex-col gap-6 mb-2">
      <va-stepper v-model="step" :steps="steps">
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
          <ZPasswordInput
            v-model="form.password"
            confirmPasswordInput
            name="password"
            label="Senha"
            id="password"
            class="mb-3"
          />
        </template>
        <!-- Outros steps ... -->
        <template #step-content-1>
          <ZCPFInput v-model="form.cpf" />
          <ZRGInput v-model="form.rg" />
        </template>
        <template #step-content-2>
          <ZSelectPermission
            class="mb-3"
            label="Permissões"
            v-model="form.permission"
          />
        </template>
        <template #step-content-3>
          <ZListRelationPosition
            :items="form.positions"
            @add="addPositions"
            @delete="actionDeletePosition"
          >
            <template #filter>
              <ZSelectPosition
                class="mb-3"
                label="Posições"
                v-model="positions"
              />
            </template>
          </ZListRelationPosition>
        </template>
        <template #step-content-4>
          <ZSelectTeam class="mb-3" label="Times" v-model="form.teams" />
        </template>
        <!-- Outros steps ... -->
      </va-stepper>
    </va-form>
    <pre
      >{{ form }} {{ positions }}
    </pre>
  </va-card>
</template>

<script>
import { useForm } from "vuestic-ui";
import ZPasswordInput from "~/components/molecules/Inputs/ZPasswordInput";
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZInput from "~/components/atoms/Inputs/ZInput";
import ZEmailInput from "~/components/molecules/Inputs/ZEmailInput";
import ZCPFInput from "~/components/molecules/Inputs/ZCPFInput";
import ZRGInput from "~/components/molecules/Inputs/ZRGInput";
import ZSelectPermission from "~/components/molecules/Selects/ZSelectPermission";
import ZSelectPosition from "~/components/molecules/Selects/ZSelectPosition";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZListRelationPosition from "~/components/organisms/List/Relations/ZListRelationPositions";

const { formData } = useForm("myForm");

export default {
  components: {
    ZPasswordInput,
    ZEmailInput,
    ZTextInput,
    ZInput,
    ZCPFInput,
    ZRGInput,
    ZSelectPermission,
    ZSelectPosition,
    ZSelectTeam,
    ZListRelationPosition,
  },
  data() {
    return {
      formData,
      step: 0,
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
        // Inicialize os dados de outros steps aqui...
      },
      positions: [],
    };
  },

  watch: {
    step(val) {
      console.log(val);
    },
  },

  methods: {
    addPositions() {
      console.log("addPositions");
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
    },
    actionDeletePosition(id) {
      this.form.positions = this.form.positions.filter((position) => {
        return position.id !== id;
      });
    },
  },
};
</script>
