<template>
  <ZUserForm
    :data="data"
    header-title="Editar perfil"
    header-subtitle="Atualize seus dados. As alterações serão refletidas em todo o sistema."
    @save="edit"
    :loading="loading"
    :error-fields="errorFields"
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
        id: localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")).id
          : null,
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

      if (value?.user) {
        this.data = transformUserData(value.user);
      }

      onResult((result) => {
        if (result?.data?.user) {
          this.data = transformUserData(result.data.user);
        }
        this.loading = false;
      });
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
          birthDate,
          nickname: form.nickname || null,
          showNickname: form.showNickname ?? false,
          roleId: Array.isArray(form.roles)
            ? form.roles
                .filter((id) => id != null && id !== "")
                .map((id) => Number(id))
            : [],
          positionId: Array.isArray(form.positions)
            ? form.positions
                .map((item) => item.id)
                .filter((id) => id != null)
                .map((id) => Number(id))
            : [],
          teamId: Array.isArray(form.teams)
            ? form.teams
                .map((item) => item.id)
                .filter((id) => id != null)
                .map((id) => Number(id))
            : [],
        };

        const { mutate } = await useMutation(query, { variables });

        await mutate();

        confirmSuccess("Dados salvos com sucesso!", () => {
          this.errors = this.errorsDefault();
          this.$router.push("/account");
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

          const footer = errorMessages.join("<br>");

          confirmError("Não foi possível salvar.", footer);
        } else {
          confirmError("Não foi possível salvar os dados.");
        }
      }
      this.loading = false;
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Editar conta",
});
</script>
