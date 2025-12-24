<template>
  <div class="trainings-listing">
    <!-- Filter Card -->
    <va-card class="filter-card">
      <div class="filter-content">
        <div class="search-section">
          <label class="filter-label">Buscar</label>
          <ZDataTableInputSearch
            v-model="internalSearchValue"
            placeholder="Nome do treino..."
            @actionSearch="handleSearch"
          />
        </div>
        <div class="filters-section">
          <div class="filter-item">
            <label class="filter-label">Time</label>
            <ZSelectTeam
              label=""
              multiple
              v-model="variablesGetTrainings.filter.teamsIds"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Jogador</label>
            <ZSelectUser
              label=""
              v-model="variablesGetTrainings.filter.playersIds"
            />
          </div>
        </div>
        <div class="filter-actions">
          <va-button
            color="#E9742B"
            class="search-button"
            @click="handleSearch"
          >
            <va-icon name="search" class="button-icon" />
            <span class="button-text">Pesquisar</span>
          </va-button>
        </div>
      </div>

      <!-- Filtros Avançados -->
      <div class="advanced-filters">
        <va-button
          preset="plain"
          class="advanced-filters-toggle"
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          <va-icon
            :name="showAdvancedFilters ? 'expand_less' : 'expand_more'"
            size="small"
          />
          <span>Filtros Avançados</span>
        </va-button>

        <div v-if="showAdvancedFilters" class="advanced-filters-content">
          <div class="filter-item">
            <label class="filter-label">Usuário Alteração</label>
            <ZSelectUser
              label=""
              v-model="variablesGetTrainings.filter.usersIds"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Data Início</label>
            <VaDateInput
              v-model="variablesGetTrainings.filter.dateStart"
              name="dateStart"
              label=""
              id="date-training-start"
              style="width: 100%"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Data Fim</label>
            <VaDateInput
              v-model="variablesGetTrainings.filter.dateEnd"
              name="dateEnd"
              label=""
              id="date-training-end"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
    </va-card>

    <!-- DataTable -->
    <ZDatatableGeneric
      :buttonActionAdd="false"
      buttonActionDelete
      includeActionsColumn
      includeActionEditList
      includeActionDeleteList
      selectable
      :items="items"
      :columns="columns"
      :loading="loading"
      :paginatorInfo="paginatorInfo"
      :filter="false"
      @search="searchTrainings"
      @actionSearch="handleSearch"
      @actionClear="clearSearch"
      @update:search="searchTrainings"
      @add="addTraining"
      @edit="editTraining"
      @delete="deleteTraining"
      @deletes="deleteTrainings"
      @update:currentPageActive="updateCurrentPageActive"
    >
      <!-- CELL -->
      <template
        #cell(name)="{
          rowKey: { id, name, dateStart, confirmationTrainingMetrics },
        }"
      >
        <ZTraining
          :data="{ id, name, dateStart }"
          :metrics="confirmationTrainingMetrics"
        />
      </template>
      <template #cell(team)="{ rowKey: { team } }">
        <div v-if="team">
          <ZTeam :data="team" :showCategoryAndLevel="true" />
        </div>
      </template>
      <template #cell(dateStart)="{ rowKey: { dateStart, dateEnd } }">
        <ZDateTraining
          :dateStart="formatTrainingDate(dateStart)"
          :dateEnd="formatTrainingDate(dateEnd)"
        />
      </template>
      <template #cell(user)="{ rowKey: { user, createdAt, updatedAt } }">
        <ZUser
          :data="user || {}"
          :createdAt="createdAt"
          :updatedAt="updatedAt"
          showUpdatedAt
          showCreatedAt
        />
      </template>
    </ZDatatableGeneric>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <va-card class="summary-card">
        <div class="summary-content">
          <div class="summary-icon">
            <va-icon name="fitness_center" size="large" color="#E9742B" />
          </div>
          <div class="summary-number">{{ paginatorInfo.total || 0 }}</div>
          <div class="summary-label">Total de Treinos</div>
        </div>
      </va-card>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import moment from "moment";
import TRAININGS from "~/graphql/training/query/trainings.graphql";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZSelectPosition from "~/components/molecules/Selects/ZSelectPosition";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import ZDataTableInputSearch from "~/components/molecules/Datatable/ZDataTableInputSearch";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import ZDateTraining from "~/components/molecules/Datatable/Slots/ZDateTraining";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam";
import ZTraining from "~/components/molecules/Datatable/Slots/ZTraining";
import TRAININGDELETE from "~/graphql/training/mutation/trainingDelete.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

//import { toRaw } from "vue"; // NOTE - Para debug

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZDateTraining,
    ZTeam,
    ZUser,
    ZSelectPosition,
    ZSelectTeam,
    ZSelectUser,
    ZDataTableInputSearch,
    ZTraining,
  },

  created() {
    this.getTrainings();
  },

  data() {
    let loading = false;

    const columns = [
      { key: "name", name: "name", label: "Treino", sortable: true },
      { key: "team", name: "team", label: "Time", sortable: true },
      {
        key: "dateStart",
        name: "dateStart",
        label: "Horário Treino",
        sortable: true,
      },
      {
        key: "user",
        name: "user",
        label: "Usuário Alteração",
        sortable: true,
      },
    ];

    return {
      items: [],
      loading,
      columns,
      paginatorInfo: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
      },
      variablesGetTrainings: {
        page: 1,
        filter: {
          teamsIds: [],
          usersIds: [],
          playersIds: [],
          search: "%%",
          dateStart: null,
          dateEnd: null,
        },
        orderBy: "id",
        sortedBy: "desc",
      },
      selectedItems: [],
      selectedItemsEmitted: [],
      selectMode: "multiple",
      selectedColor: "primary",
      selectModeOptions: ["single", "multiple"],
      selectColorOptions: ["primary", "danger", "warning", "#EF467F"],
      internalSearchValue: "",
      showAdvancedFilters: false,
    };
  },

  methods: {
    unselectItem(item) {
      this.selectedItems = this.selectedItems.filter(
        (selectedItem) => selectedItem !== item
      );
    },
    addTraining() {
      this.$router.push("/trainings/create");
    },
    editTraining(id) {
      this.$router.push(`/trainings/edit/${id}`);
    },
    async deleteItems(ids) {
      try {
        this.loading = true;

        const query = gql`
          ${TRAININGDELETE}
        `;

        const variables = {
          id: ids,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Treino(s) deletado(s) com sucesso!", () => {
          this.items = this.items.filter((item) => !ids.includes(item.id));
        });

        this.getTrainings({ fetchPolicy: "network-only" });
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
            return item;
          });

          this.errorFields = Object.keys(this.errors);

          confirmError("Ocorreu um erro ao deletar o treino!", errorMessages);
        } else {
          confirmError("Ocorreu um erro ao deletar o treino!");
        }
      }
      this.loading = false;
    },

    formatTrainingDate(dateStart) {
      return moment(dateStart);
    },

    async deleteTraining(id) {
      await this.deleteItems([id]);
    },

    async deleteTrainings(items) {
      await this.deleteItems(items);
    },

    updateCurrentPageActive(page) {
      this.variablesGetTrainings.page = page;
      this.getTrainings();
    },

    searchTrainings(search) {
      // Se search for vazio ou undefined, usar %%
      if (!search || search === "") {
        this.variablesGetTrainings.filter.search = "%%";
      } else {
        this.variablesGetTrainings.filter.search = `%${search}%`;
      }
    },

    handleSearch() {
      // Atualizar o filtro de busca com o valor do campo de busca
      if (
        this.internalSearchValue !== undefined &&
        this.internalSearchValue !== null
      ) {
        this.searchTrainings(this.internalSearchValue);
      }
      // Executar a busca com os filtros atualizados
      this.getTrainings({ fetchPolicy: "network-only" });
    },

    clearSearch() {
      this.internalSearchValue = "";
      this.variablesGetTrainings.filter = {
        teamsIds: [],
        usersIds: [],
        playersIds: [],
        search: "%%",
        dateStart: null,
        dateEnd: null,
      };
      // Recarregar dados após limpar filtros
      this.getTrainings({ fetchPolicy: "network-only" });
    },

    getTrainings(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${TRAININGS}
      `;

      let teamsIdsValues =
        this.variablesGetTrainings.filter.teamsIds?.map((team) =>
          parseInt(team?.value || team)
        ) || [];

      let usersIdsValues =
        this.variablesGetTrainings.filter.usersIds?.map((user) =>
          parseInt(user?.value || user)
        ) || [];

      let playersIdsValues =
        this.variablesGetTrainings.filter.playersIds?.map((player) =>
          parseInt(player?.value || player)
        ) || [];

      let dateEnd = this.variablesGetTrainings.filter.dateEnd;

      if (dateEnd) {
        dateEnd = moment(dateEnd).format("YYYY-MM-DD 23:59:59");
      }

      let dateStart = this.variablesGetTrainings.filter.dateStart;

      if (dateStart) {
        dateStart = moment(dateStart).format("YYYY-MM-DD 00:00:00");
      }

      const consult = {
        ...this.variablesGetTrainings,
        filter: {
          ...this.variablesGetTrainings.filter,
          teamsIds: teamsIdsValues,
          usersIds: usersIdsValues,
          playersIds: playersIdsValues,
          dateStart,
          dateEnd,
        },
      };

      const { onResult } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "network-only", // Sempre buscar dados atualizados
      });

      onResult((result) => {
        this.loading = false;
        if (result?.data?.trainings) {
          this.paginatorInfo =
            result.data.trainings.paginatorInfo || this.paginatorInfo;
          // Sempre atualizar items, mesmo se for array vazio
          this.items = result.data.trainings.data || [];
        } else {
          this.items = [];
        }
      });
    },
  },
});
</script>

<style scoped>
.trainings-listing {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-content {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
  justify-content: space-between;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.filters-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 200px;
}

.filter-item :deep(.va-input-wrapper) {
  margin-bottom: 0;
}

.filter-item :deep(.va-select) {
  margin-top: 0;
}

.filter-item :deep(.va-input-wrapper__field) {
  margin-top: 0;
}

.filter-item :deep(.va-input-wrapper__label) {
  display: none;
}

.filter-item :deep(.va-date-input-wrapper__label) {
  display: none;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #0b1e3a;
  margin-bottom: 8px;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  margin-left: auto;
}

.search-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #e9742b !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(233, 116, 43, 0.3);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  height: 40px;
}

.search-button:hover {
  background-color: #d6652a !important;
  box-shadow: 0 4px 12px rgba(233, 116, 43, 0.4);
  transform: translateY(-1px);
}

.search-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(233, 116, 43, 0.3);
}

.search-button .button-icon {
  font-size: 18px;
  color: #ffffff;
}

.search-button .button-text {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

/* Filtros Avançados */
.advanced-filters {
  margin-top: 20px;
  padding-top: 0;
}

.advanced-filters-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d !important;
  font-size: 14px;
  font-weight: 500;
  padding: 0 !important;
  margin-bottom: 16px;
}

.advanced-filters-toggle:hover {
  color: #e9742b !important;
}

.advanced-filters-content {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 8px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.summary-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  margin-bottom: 8px;
}

.summary-number {
  font-size: 36px;
  font-weight: 700;
  color: #0b1e3a;
}

.summary-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
  }

  .search-section,
  .filter-item {
    width: 100%;
    min-width: unset;
  }
}
</style>
