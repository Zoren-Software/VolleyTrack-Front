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
import {
  confirmSuccess,
  confirmError,
  confirmAskSendEmailNotification,
} from "~/utils/sweetAlert2/swalHelper";

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
      confirmAskSendEmailNotification(
        async () => {
          await this.submitCreate(form, true);
        },
        async () => {
          await this.submitCreate(form, false);
        }
      );
    },

    async submitCreate(form, sendEmailNotification) {
      try {
        this.loading = true;
        this.error = false;

        const query = gql`
          ${USERCREATE}
        `;

        const birthDate = form.birthDate
          ? new Date(form.birthDate).toISOString().split("T")[0]
          : null;

        const variables = {
          name: form.name,
          email: form.email,
          password: form.password === "" ? undefined : form.password,
          cpf: form.cpf || null,
          rg: form.rg || null,
          phone: form.phone || null,
          birthDate,
          roleId: form.roles.map((item) => item.id),
          positionId: form.positions.map((item) => item.id),
          teamId: form.teams.map((item) => item.id),
          sendEmailNotification,
        };

        const { mutate } = await useMutation(query, { variables });
        await mutate();

        confirmSuccess("Usuário salvo com sucesso!", () => {
          this.errors = this.errorsDefault();
          this.$router.push("/players");
        });
      } catch (error) {
        console.error(error);
        this.error = true;

        if (error?.graphQLErrors?.[0]?.extensions?.validation) {
          this.errors = error.graphQLErrors[0].extensions.validation;
          this.errorFields = Object.keys(this.errors);

          const footer = Object.values(this.errors)
            .map((v) => v[0])
            .join("<br>");
          confirmError("Erro ao salvar o usuário!", footer);
        } else {
          confirmError("Erro ao salvar o usuário!");
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Criar Jogador",
});
</script>
