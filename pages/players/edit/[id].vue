<template>
  <ZUserForm
    :data="data"
    @save="edit"
    :loading="loading"
    :errorFields="errorFields"
    :errors="errors"
  />
</template>

<script>
import ZUserForm from "~/components/organisms/Forms/User/ZUserForm";
import PLAYER from "~/graphql/user/query/user.graphql";
import USEREDIT from "~/graphql/user/mutation/userEdit.graphql";
import { transformUserData } from "~/utils/forms/userForm";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  components: {
    ZUserForm,
  },
  mounted() {
    this.getPlayer();
  },
  data() {
    return {
      data: {},
      variablesGetPlayer: {
        id: this.$route.params.id,
      },
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
    getPlayer() {
      this.loading = true;

      const query = gql`
        ${PLAYER}
      `;

      const consult = {
        ...this.variablesGetPlayer,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.user) {
          this.data = transformUserData(result.data.user);
        }
      });

      if (value) {
        if (value?.user) {
          this.data = transformUserData(value.user);
        }
      }
      this.loading = false;
    },

    async edit(form) {
      try {
        this.loading = true;
        this.error = false;

        const query = gql`
          ${USEREDIT}
        `;

        const birthDate = form.birthDate
          ? new Date(form.birthDate).toISOString().split("T")[0]
          : null;

        const variables = {
          id: form.id,
          name: form.name,
          email: form.email,
          password: form.password,
          cpf: form.cpf,
          rg: form.rg,
          phone: form.phone,
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
<script setup>
useHead({
  titleTemplate: "Editar Jogador",
});
</script>
