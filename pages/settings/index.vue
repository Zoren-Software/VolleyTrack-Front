<template>
  <div class="list-page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Configurações</h1>
          <p class="page-subtitle">Gerencie as configurações da sua conta</p>
        </div>
      </div>
    </div>

    <ZSettingsForm
      :data="data"
      @save="edit"
      :loading="loading"
      :errorFields="errorFields"
      :errors="errors"
    />
  </div>
</template>

<script>
import ZSettingsForm from "~/components/organisms/Forms/Settings/ZSettingsForm";
import SETTING from "~/graphql/setting/query/setting.graphql";
import SETTINGEDIT from "~/graphql/setting/mutation/settingEdit.graphql";
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
        nameTenant: [],
        languageId: [],
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
          ${SETTINGEDIT}
        `;

        console.log(form);

        const variables = {
          nameTenant: form.nameTenant,
          languageId: form.languageSelected.value,
        };

        console.log(variables);

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Configurações salvas com sucesso!", () => {
          this.errors = this.errorsDefault();

          this.$router.push("/settings");
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

          confirmError("Ocorreu um erro ao salvar as configurações!", footer);
        } else {
          confirmError("Ocorreu um erro ao salvar as configurações!");
        }
      }
      this.loading = false;
    },
  },
};
</script>
<script setup>
useHead({
  titleTemplate: "Configurações",
});
</script>

<style scoped>
.list-page-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }
}
</style>
