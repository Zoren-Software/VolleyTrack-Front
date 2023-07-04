<template>
  <va-card class="my-3 mr-3">
    <va-form ref="myForm" stateful class="flex flex-col gap-6 mb-2">
      <va-stepper v-model="step" :steps="steps" aria-label="lala">
        <template #step-content-0>
          <ZTextInput name="name" label="Nome" id="name" class="mb-3" />
          <ZEmailInput v-model="email" label="E-mail" id="email" class="mb-3" />

          <ZPasswordInput
            confirmPasswordInput
            name="password"
            v-model="password"
            label="Senha"
            id="password"
            class="mb-3"
          />
        </template>
        <template #step-content-1>
          <ul>
            <li>Fill out shipping information</li>
            <li>Choose payment method</li>
          </ul>
        </template>
        <template #step-content-2>
          <ul>
            <li>Fill out shipping information</li>
            <li>Choose payment method</li>
          </ul>
        </template>
      </va-stepper>
    </va-form>
  </va-card>
</template>

<script>
import { useForm } from "vuestic-ui";
import ZPasswordInput from "~/components/molecules/Inputs/ZPasswordInput";
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZEmailInput from "~/components/molecules/Inputs/ZEmailInput";

const { formData } = useForm("myForm");

export default {
  components: {
    ZPasswordInput,
    ZEmailInput,
    ZTextInput,
  },
  data() {
    return {
      password: "",
      formData,
      step: 0,
      steps: [
        { label: "Informações Essenciais" },
        { label: "Informações Pessoais" },
        { label: "Permissão" },
        { label: "Posição" },
      ],
    };
  },
};
</script>
