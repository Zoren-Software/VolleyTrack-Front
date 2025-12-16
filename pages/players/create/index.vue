<template>
  <ZUserForm
    @save="create"
    :loading="loading"
    :errorFields="errorFields"
    :errors="errors"
    header-title="Cadastro de Jogador"
    header-subtitle="Crie um novo jogador para sua equipe"
  />
</template>

<script>
import ZUserForm from "~/components/organisms/Forms/User/ZUserForm";
import USERCREATE from "~/graphql/user/mutation/userCreate.graphql";
import {
  confirmSuccess,
  confirmAskSendEmailNotification,
} from "~/utils/sweetAlert2/swalHelper";
import { handleMutation } from "~/utils/graphql/mutationHandler";

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
      this.loading = true;
      this.error = false;

      try {
        await handleMutation(
          async () => {
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
              roleId: Array.isArray(form.roles)
                ? form.roles
                    .map((item) => (typeof item === "object" ? item.id : item))
                    .filter((id) => id != null)
                : [],
              positionId: Array.isArray(form.positions)
                ? form.positions
                    .map((item) => item.id)
                    .filter((id) => id != null)
                : [],
              teamId: Array.isArray(form.teams)
                ? form.teams.map((item) => item.id).filter((id) => id != null)
                : [],
              sendEmailNotification,
            };

            const { mutate } = await useMutation(query, { variables });
            return await mutate();
          },
          {
            onSuccess: () => {
              confirmSuccess("Usuário salvo com sucesso!", () => {
                this.errors = this.errorsDefault();
                this.$router.push("/players");
              });
            },
            onError: (error) => {
              this.error = true;

              if (error?.graphQLErrors?.[0]?.extensions?.validation) {
                this.errors = error.graphQLErrors[0].extensions.validation;
                this.errorFields = Object.keys(this.errors);
              }
            },
            errorTitle: "Erro ao salvar o usuário!",
          }
        );
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
