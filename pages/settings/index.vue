<template>
  <ZSettingsForm
    :data="data"
    @save="edit"
    :loading="loading"
    :errorFields="errorFields"
    :errors="errors"
  />
</template>

<script>
import ZSettingsForm from "~/components/organisms/Forms/Settings/ZSettingsForm";
import SETTING from "~/graphql/settings/query/setting.graphql";
import TEAMEDIT from "~/graphql/team/mutation/teamEdit.graphql";
import { transformTeamData } from "~/utils/forms/teamForm";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  components: {
    ZSettingsForm,
  },
  mounted() {
    this.getSettings();
  },
  data() {
    return {
      data: {},
      loading: false,
      error: false,
      errorFields: [],
      errors: this.errorsDefault(),
    };
  },
  methods: {
    errorsDefault() {
      return {
        name: [],
        email: [],
        password: [],
        cpf: [],
        rg: [],
        phone: [],
        birthDate: [],
        roleId: [],
        teamId: [],
      };
    },
    getSettings() {
      this.loading = true;

      const query = gql`
        ${SETTING}
      `;

      const consult = {
        id: 1,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.config) {
          this.data = result.data.config;
          this.data = {
            ...this.data,
            languageId: this.data.language.id,
            languageName: this.data.language.name,
          };
        }
      });

      if (value) {
        if (value?.data) {
          this.data = value.data.config;
          this.data = {
            ...this.data,
            languageId: this.data.language.id,
            languageName: this.data.language.name,
          };
        }
      }
      this.loading = false;
    },

    async edit(form) {
      try {
        this.loading = true;
        this.error = false;

        const query = gql`
          ${TEAMEDIT}
        `;

        const variables = {
          id: form.id,
          name: form.name,
          playerId: form.users.map((item) => item.id),
        };

        console.log(variables);

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Time salvo com sucesso!", () => {
          this.errors = this.errorsDefault();

          this.$router.push("/teams");
        });
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

          // criar um título para essas validacões que seram mostradas
          const footer = errorMessages.join("<br>");

          confirmError("Ocorreu um erro ao salvar o time!", footer);
        } else {
          confirmError("Ocorreu um erro ao salvar o time!");
        }
      }
      this.loading = false;
    },
  },
};
</script>
