<template>
  <ZDatatableGeneric
    buttonActionAdd
    buttonActionDelete
    includeActionsColumn
    includeActionEditList
    includeActionDeleteList
    textAdvancedFilters
    selectable
    :items="items"
    :columns="columns"
    :loading="loading"
    :paginatorInfo="paginatorInfo"
    :filter="true"
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
    <!-- FILTER -->
    <template #filter>
      <!-- TODO - Pensar nos reais filtros que deveram existir aqui -->
      <div class="row">
        <div class="flex flex-col md6 mb-2">
          <div class="item mr-2">
            <ZSelectTeam
              label="Times"
              multiple
              v-model="variablesGetTrainings.filter.teamsIds"
            />
          </div>
        </div>
        <div class="flex flex-col md6 mb-2">
          <div class="item mr-2">
            <ZSelectUser
              label="Usuário Alteração"
              v-model="variablesGetTrainings.filter.usersIds"
            />
          </div>
        </div>
        <div class="flex flex-col md6 mb-2">
          <div class="item mr-2">
            <ZSelectUser
              label="Jogadores"
              v-model="variablesGetTrainings.filter.playersIds"
            />
          </div>
        </div>
        <div class="flex flex-col md3 mb-2">
          <div class="item mr-2">
            <VaDateInput
              v-model="variablesGetTrainings.filter.dateStart"
              name="dateStart"
              label="Inicio Data Treino"
              id="date-training"
              style="width: 100%"
              class="mb-3"
            />
          </div>
        </div>
        <div class="flex flex-col md3 mb-2">
          <div class="item mr-2">
            <VaDateInput
              v-model="variablesGetTrainings.filter.dateEnd"
              name="dateEnd"
              label="Fim Data Treino"
              id="date-training"
              style="width: 100%"
              class="mb-3"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- CELL -->
    <template
      #cell(name)="{ rowKey: { name, dateStart, confirmationTrainingMetrics } }"
    >
      <ZTraining
        :data="{ name, dateStart }"
        :metrics="confirmationTrainingMetrics"
      />
    </template>
    <template #cell(team)="{ rowKey: { team } }">
      <div v-if="team">
        <ZTeam :data="team" />
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
</template>

<script>
import { defineComponent } from "vue";
import moment from "moment";
import TRAININGS from "~/graphql/training/query/trainings.graphql";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZSelectPosition from "~/components/molecules/Selects/ZSelectPosition";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
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
    ZTraining,
  },

  created() {
    this.getTrainings();
  },

  data() {
    let loading = false;

    const columns = [
      { key: "id", name: "id", sortable: true },
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
      // Garantir que o search está atualizado antes de buscar
      // O search já foi atualizado pelo evento @search
      this.getTrainings({ fetchPolicy: "network-only" });
    },

    clearSearch() {
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

      let teamsIdsValues = this.variablesGetTrainings.filter.teamsIds?.map(
        (team) => parseInt(team?.value || team)
      ) || [];

      let usersIdsValues = this.variablesGetTrainings.filter.usersIds?.map(
        (user) => parseInt(user?.value || user)
      ) || [];

      let playersIdsValues = this.variablesGetTrainings.filter.playersIds?.map(
        (player) => parseInt(player?.value || player)
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
          this.paginatorInfo = result.data.trainings.paginatorInfo || this.paginatorInfo;
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
