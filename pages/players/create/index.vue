<template>
  <ZUserForm
    @save="create"
    :loading="loading"
    :errorFields="errorFields"
    :errors="errors"
  />
</template>

<script>
import ZUserForm from "~/components/organisms/Forms/User/ZUserForm";
import USERCREATE from "~/graphql/user/mutation/userCreate.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  components: {
    ZUserForm,
  },

  data() {
    return {
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
        roleId: [],
        teamId: [],
      };
    },
    async create(form) {
      try {
        this.loading = true;
        this.error = false;

        const query = gql`
          ${USERCREATE}
        `;

        const birthDate =
          form.birthDate && typeof form.birthDate === "string"
            ? form.birthDate.split("/").reverse().join("-")
            : null;

        const variables = {
          name: form.name,
          email: form.email,
          password: form.password,
          cpf: form.cpf == "" ? null : form.cpf,
          rg: form.rg == "" ? null : form.rg,
          phone: form.phone == "" ? null : form.phone,
          birthDate: birthDate,
          roleId: form.roles.map((item) => item.id),
          positionId: form.positions.map((item) => item.id),
          teamId: form.teams.map((item) => item.id),
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Usuário salvo com sucesso!", () => {
          this.errors = this.errorsDefault();

          this.$router.push("/players");
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

          confirmError("Ocorreu um erro ao salvar o usuário!", footer);
        } else {
          confirmError("Ocorreu um erro ao salvar o usuário!");
        }
      }
      this.loading = false;
    },
  },
};
</script>
