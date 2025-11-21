<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1>Configurações</h1>
      <div class="settings-nav">
        <button
          @click="$router.push('/settings')"
          :class="{ active: $route.path === '/settings' }"
          class="nav-button"
        >
          Configurações Gerais
        </button>
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
.settings-page {
  padding: 20px;
}

.settings-header {
  margin-bottom: 30px;
}

.settings-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
}

.settings-nav {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.nav-button {
  background: none;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.nav-button:hover {
  color: #374151;
  background: #f9fafb;
}

.nav-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f8f9ff;
}

@media (max-width: 768px) {
  .settings-nav {
    flex-direction: column;
    gap: 0;
  }

  .nav-button {
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 0;
  }

  .nav-button.active {
    border-bottom-color: #667eea;
  }
}
</style>
