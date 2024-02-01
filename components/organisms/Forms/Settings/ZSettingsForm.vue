<template>
  <va-card class="my-3 mr-3">
    <va-form ref="myForm" class="flex flex-col gap-6 mb-2 px-4 py-4">
      <ZTextInput
        v-model="form.nameTenant"
        name="name-tenant"
        label="Nome Tenant"
        :messages="[
          'Nome do Tenant apenas para exibição, não influencia o subdomínio existente',
        ]"
        id="name-tenant"
        class="mb-3"
        :error-messages="errors.nameTenant || []"
      />
      <!-- Fazendo a linguagem vir selecionada -->
      <ZSelectLanguage
        class="mb-3"
        label="Linguagem"
        v-model="form.languageSelected"
        :ignoreIds="[form.languageId]"
        :messages="['Afetará todos os usuários da aplicação']"
      />
      <va-button color="primary" @click="save()">Salvar</va-button>
    </va-form>
  </va-card>
</template>

<script>
import { useForm } from "vuestic-ui";
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import ZListRelationUsers from "~/components/organisms/List/Relations/ZListRelationUsers";
import ZSelectLanguage from "~/components/molecules/Selects/ZSelectLanguage";

import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

const { formData } = useForm("myForm");

export default {
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
    ZListRelationUsers,
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
