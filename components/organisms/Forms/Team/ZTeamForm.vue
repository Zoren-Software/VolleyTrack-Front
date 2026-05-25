<template>
  <div class="form-container">
    <va-form
      ref="myForm"
      :class="[
        'team-form-inner',
        'flex',
        'flex-col',
        'mb-2',
        'w-full',
        useWizard ? 'team-form-gap--wizard' : 'gap-6',
      ]"
    >
      <template v-if="!useWizard">
        <va-card class="info-card">
          <ZTeamFormEssentialFields
            :form="form"
            :category-options="categoryOptions"
            :sorted-levels="sortedLevels"
            :categories-loading="categoriesLoading"
            :levels-loading="levelsLoading"
            :error-fields="errorFields"
            :errors="errors"
            @update:name="form.name = $event"
            @select-category="selectCategory"
            @select-level="selectLevel"
          />
        </va-card>
        <va-card class="players-card">
          <ZTeamFormPlayersFields
            v-model:users="users"
            :form="form"
            @add-users="addUsers"
            @delete-user="actionDeleteUser"
          />
        </va-card>
      </template>

      <template v-else>
        <va-stepper
          v-model="wizardStep"
          :steps="wizardSteps"
          controls-hidden
          class="team-form-stepper"
        >
          <template #step-content-0>
            <div class="wizard-step-inner">
              <va-card class="info-card">
                <ZTeamFormEssentialFields
                  :form="form"
                  :category-options="categoryOptions"
                  :sorted-levels="sortedLevels"
                  :categories-loading="categoriesLoading"
                  :levels-loading="levelsLoading"
                  :error-fields="errorFields"
                  :errors="errors"
                  @update:name="form.name = $event"
                  @select-category="selectCategory"
                  @select-level="selectLevel"
                />
              </va-card>
            </div>
          </template>
          <template #step-content-1>
            <div class="wizard-step-inner">
              <va-card class="players-card">
                <ZTeamFormPlayersFields
                  v-model:users="users"
                  :form="form"
                  @add-users="addUsers"
                  @delete-user="actionDeleteUser"
                />
              </va-card>
            </div>
          </template>
        </va-stepper>
      </template>

      <div :class="['action-buttons', { 'action-buttons--wizard': useWizard }]">
        <va-button
          v-if="useWizard && wizardStep > 0"
          color="secondary"
          class="mr-1"
          @click="wizardStep--"
        >
          Anterior
        </va-button>
        <va-button
          v-else
          color="secondary"
          class="mr-1"
          @click="goBack"
        >
          Voltar
        </va-button>
        <va-button
          v-if="useWizard && wizardStep < 1"
          color="primary"
          @click="goToPlayersStep"
        >
          Próximo
        </va-button>
        <va-button
          v-else
          color="primary"
          :loading="loading"
          @click="save"
        >
          Salvar
        </va-button>
      </div>
    </va-form>
  </div>
</template>

<script>
import ZTeamFormEssentialFields from "~/components/organisms/Forms/Team/ZTeamFormEssentialFields.vue";
import ZTeamFormPlayersFields from "~/components/organisms/Forms/Team/ZTeamFormPlayersFields.vue";
import TEAM_CATEGORIES from "~/graphql/teamCategories/query/teamCategories.graphql";
import TEAM_LEVELS from "~/graphql/teamLevel/query/teamLevel.graphql";
import { gql } from "@apollo/client/core";
import { useNuxtApp } from "#app";
import { confirmSuccess } from "~/utils/sweetAlert2/swalHelper";
import { resolveListRelationDeleteId } from "~/utils/resolveListRelationDeleteId";

const LEVEL_SORT_ORDER = ["bronze", "prata", "ouro", "outro", "elite"];

export default {
  components: {
    ZTeamFormEssentialFields,
    ZTeamFormPlayersFields,
  },

  props: {
    data: {
      type: Object,
      default: () => ({
        name: "",
        users: [],
      }),
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
      default: () => ({
        name: [],
        users: [],
      }),
    },
    useWizard: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["save", "validation-failed"],

  data() {
    return {
      users: [],
      form: {
        name: this.data.name ?? "",
        users: this.data.users ?? [],
        teamCategory: this.data.teamCategory || null,
        teamLevel: this.data.teamLevel || null,
      },
      categoryOptions: [],
      levelOptions: [],
      categoriesLoading: false,
      levelsLoading: false,
      wizardStep: 0,
    };
  },

  computed: {
    wizardSteps() {
      return [
        { label: "Informações essenciais" },
        { label: "Jogadores" },
      ];
    },
    sortedLevels() {
      const norm = (s) =>
        String(s || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      return [...this.levelOptions].sort((a, b) => {
        const na = norm(a.name);
        const nb = norm(b.name);
        let ia = LEVEL_SORT_ORDER.length;
        let ib = LEVEL_SORT_ORDER.length;
        LEVEL_SORT_ORDER.forEach((token, idx) => {
          if (na.includes(token) && ia === LEVEL_SORT_ORDER.length) ia = idx;
          if (nb.includes(token) && ib === LEVEL_SORT_ORDER.length) ib = idx;
        });
        if (ia !== ib) return ia - ib;
        return a.name.localeCompare(b.name, "pt-BR");
      });
    },
  },

  watch: {
    data(val) {
      this.form = {
        name: val.name ?? "",
        users: val.users ?? [],
        teamCategory: val.teamCategory || null,
        teamLevel: val.teamLevel || null,
      };
    },
  },

  async mounted() {
    await Promise.all([this.fetchCategories(), this.fetchLevels()]);
  },

  methods: {
    async fetchCategories() {
      this.categoriesLoading = true;
      try {
        const q = gql`
          ${TEAM_CATEGORIES}
        `;
        const rows = await this.fetchAllPages(q, "teamCategories");
        this.categoryOptions = rows.map((item) => ({
          id: Number(item.id),
          name: item.name,
        }));
      } catch (e) {
        console.error("ZTeamForm - categorias:", e);
      } finally {
        this.categoriesLoading = false;
      }
    },
    async fetchLevels() {
      this.levelsLoading = true;
      try {
        const q = gql`
          ${TEAM_LEVELS}
        `;
        const rows = await this.fetchAllPages(q, "teamLevels");
        this.levelOptions = rows.map((item) => ({
          id: Number(item.id),
          name: item.name,
        }));
      } catch (e) {
        console.error("ZTeamForm - níveis:", e);
      } finally {
        this.levelsLoading = false;
      }
    },
    async fetchAllPages(query, dataKey) {
      const nuxtApp = useNuxtApp();
      const apolloClient = nuxtApp._apolloClients?.default;
      if (!apolloClient) return [];
      const perPage = 50;
      let page = 1;
      let hasMore = true;
      const all = [];
      while (hasMore) {
        const result = await apolloClient.query({
          query,
          variables: {
            filter: { search: "%%" },
            first: perPage,
            page,
          },
          fetchPolicy: "network-only",
        });
        const payload = result?.data?.[dataKey];
        const rows = payload?.data ?? [];
        all.push(...rows);
        hasMore = Boolean(payload?.paginatorInfo?.hasMorePages);
        page += 1;
      }
      return all;
    },
    selectCategory(cat) {
      this.form.teamCategory = {
        value: cat.id,
        text: cat.name,
      };
    },
    selectLevel(level) {
      this.form.teamLevel = {
        value: level.id,
        text: level.name,
      };
    },
    addUsers() {
      const transformedUser = this.users.map((item) => ({
        id: item.value,
        user: item,
      }));

      transformedUser.forEach((newTeam) => {
        const isAlreadyAdded = this.form.users.some(
          (existingTeam) => existingTeam.id === newTeam.id
        );

        if (!isAlreadyAdded) {
          this.form.users.push(newTeam);
        }
      });

      this.users = [];
    },

    actionDeleteUser(payload) {
      const idNum = resolveListRelationDeleteId(payload);
      if (idNum === null) {
        return;
      }
      this.form.users = this.form.users.filter(
        (user) => Number(user.id) !== idNum,
      );
      confirmSuccess("Jogador removido com sucesso!");
    },

    validateEssentialFields() {
      const name = String(this.form.name ?? "").trim();
      const errors = [];

      if (!name || name.length < 3) {
        errors.push("name");
      }

      return { valid: errors.length === 0, errorFields: errors, name };
    },

    goToPlayersStep() {
      const { valid, errorFields } = this.validateEssentialFields();
      if (!valid) {
        this.$emit("validation-failed", { fields: errorFields, name });
        return;
      }
      this.wizardStep++;
    },

    save() {
      const { valid, errorFields, name } = this.validateEssentialFields();
      if (!valid) {
        this.$emit("validation-failed", { fields: errorFields, name });
        return;
      }
      this.form.name = name;
      this.$emit("save", this.form);
    },

    goBack() {
      this.$router.push("/teams");
    },
  },
};
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  padding: 24px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.team-form-inner {
  width: 100%;
  min-width: 0;
}

.team-form-gap--wizard {
  gap: 0.5rem;
}

.team-form-stepper {
  width: 100%;
  min-width: 0;
  --va-stepper-step-content-wrapper-padding: 0;
  --va-stepper-step-content-margin: 0.35rem 0 0;
}

.team-form-stepper :deep(.va-stepper__content) {
  padding-top: 4px;
  padding-bottom: 0;
  width: 100%;
}

.team-form-stepper :deep([class*="step-content"]) {
  width: 100%;
}

.wizard-step-inner {
  width: 100%;
  max-width: 920px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.info-card,
.players-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 920px;
  margin-left: auto;
  margin-right: auto;
  padding: 32px 28px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  max-width: 920px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 8px;
  padding-top: 12px;
  box-sizing: border-box;
}

.action-buttons--wizard {
  margin-top: 0;
  padding-top: 0.5rem;
}

.action-buttons va-button {
  border-radius: 8px;
}
</style>
