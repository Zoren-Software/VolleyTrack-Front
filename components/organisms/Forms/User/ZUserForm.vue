<template>
  <va-card class="my-3 mr-3">
    <va-form ref="myForm" stateful class="mb-2 flex flex-col gap-2">
      <va-stepper v-model="step" :steps="steps" aria-label="lala">
        <template #step-content-0>
          <ZTextInput name="name" label="Nome" id="name" />
          <ZPasswordInput name="password" label="Password" id="password" />
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

const { formData } = useForm("myForm");

export default {
  components: {
    ZPasswordInput,
    ZTextInput,
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
      ],
    };
  },
};
</script>
