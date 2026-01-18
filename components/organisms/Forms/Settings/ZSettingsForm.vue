<template>
  <div class="header-section">
    <h1 class="main-title">Configurações Gerais</h1>
    <p class="main-subtitle">
      Atualize as informações do tenant e a linguagem padrão do sistema.
    </p>
  </div>
  <div class="card-container">
    <va-card class="my-3">
      <va-form ref="myForm" class="flex flex-col gap-6 mb-2 px-4 py-4">
        <ZTextInput
          v-model="form.nameTenant"
          name="name-tenant"
          label="Nome Tenant"
          placeholder="Digite o nome do tenant"
          :messages="[
            'Nome do Tenant apenas para exibição, não influencia o subdomínio existente',
          ]"
          id="name-tenant"
          class="mb-3"
          :error-messages="errors.nameTenant || []"
        />
        <ZSelectLanguage
          class="mb-3"
          label="Linguagem"
          placeholder="Selecione uma linguagem"
          v-model="form.languageSelected"
          :ignoreIds="[form.languageId]"
          :messages="['Afetará todos os usuários da aplicação']"
        />
        <va-button color="primary" @click="save()">Salvar</va-button>
      </va-form>
    </va-card>
  </div>
</template>

<script>
import { useForm } from "vuestic-ui";
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import ZSelectLanguage from "~/components/molecules/Selects/ZSelectLanguage";

import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

const { formData } = useForm("myForm");

export default {
  emits: ["save"],
  mounted() {
    this.getLanguage();
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          name: "",
          language: {},
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
          language: [],
        };
      },
    },
  },
  components: {
    ZTextInput,
    ZSelectUser,
    ZSelectLanguage,
  },

  data() {
    return {
      formData,
      languages: [],
      form: {
        ...this.data,
        languageSelected: {
          value: this.data.languageId,
          text: this.data.languageName,
        },
      },
    };
  },

  watch: {
    data(val) {
      this.form = {
        ...val,
        languageSelected: {
          value: val.languageId,
          text: val.languageName,
        },
      };
    },
  },

  methods: {
    getLanguage() {
      this.languageSelected = this.form.language;
    },
    errorsDefault() {
      return {
        name: [],
        languages: [],
      };
    },

    async save() {
      this.$emit("save", this.form);
    },
  },
};
</script>

<style scoped>
.header-section {
  text-align: center;
  margin-bottom: 20px;
}

.main-title {
  font-size: 24px;
  font-weight: bold;
  color: #0b1e3a;
}

.main-subtitle {
  font-size: 16px;
  color: #6c757d;
}

.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  max-width: 600px;
}
</style>
