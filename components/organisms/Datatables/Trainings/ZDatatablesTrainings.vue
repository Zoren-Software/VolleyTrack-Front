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
    @actionSearch="getTrainings"
    @actionClear="clearSearch"
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
              label="Usuário Modificação"
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
      </div>
    </template>

    <!-- CELL -->
    <template #cell(team)="{ rowKey: { team } }">
      <ZTeam :data="team" />
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

          confirmError("Ocorreu um erro ao deletar o treino!", footer);
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
      this.variablesGetTrainings.filter.search = `%${search}%`;
    },

    clearSearch() {
      this.variablesGetTrainings.filter = {
        search: "%%",
        teamsIds: [],
      };
    },

    getTrainings() {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${TRAININGS}
      `;

      let teamsIdsValues = this.variablesGetTrainings.filter.teamsIds.map(
        (team) => parseInt(team.value)
      );

      let usersIdsValues = this.variablesGetTrainings.filter.usersIds.map(
        (user) => parseInt(user.value)
      );

      let playersIdsValues = this.variablesGetTrainings.filter.playersIds.map(
        (player) => parseInt(player.value)
      );

      const consult = {
        ...this.variablesGetTrainings,
        filter: {
          ...this.variablesGetTrainings.filter,
          teamsIds: teamsIdsValues,
          usersIds: usersIdsValues,
          playersIds: playersIdsValues,
        },
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.trainings?.data.length > 0) {
          this.paginatorInfo = result.data.trainings.paginatorInfo;
          this.items = result.data.trainings.data;
        }
      });

      if (value) {
        if (value?.trainings?.data.length > 0) {
          this.paginatorInfo = value.trainings.paginatorInfo;
          this.items = value.trainings.data;
        }
      }
      this.loading = false;
    },
  },
});
</script>
