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
    @search="searchPlayers"
    @actionSearch="getTrainings"
    @actionClear="clearSearch"
    @add="addPlayer"
    @edit="editPlayer"
    @delete="deletePlayer"
    @deletes="deletePlayers"
    @update:currentPageActive="updateCurrentPageActive"
  >
    <!-- FILTER -->
    <template #filter>
      <!-- TODO - Pensar nos reais filtros que deveram existir aqui -->
    </template>

    <!-- CELL -->
    <template #cell(team)="{ rowKey: { team } }">
      <ZTeam :data="team" />
    </template>
    <template #cell(dateStart)="{ rowKey: { dateStart, dateEnd } }">
      <ZDateTraining
        :date="formatTrainingDate(dateStart)"
        :time="formatTrainingDateStart(dateStart, dateEnd)"
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
import ZDateTraining from "~/components/molecules/Datatable/Slots/ZDateTraining";
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";
import ZCPF from "~/components/molecules/Datatable/Slots/ZCPF";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam";
import USERDELETE from "~/graphql/user/mutation/userDelete.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

//import { toRaw } from "vue"; // NOTE - Para debug

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZDateTraining,
    ZPosition,
    ZCPF,
    ZTeam,
    ZSelectPosition,
    ZSelectTeam,
  },

  created() {
    this.getTrainings();
  },

  data() {
    let loading = false;

    const columns = [
      { key: "id", name: "id", sortable: true },
      { key: "name", name: "name", label: "Treinos", sortable: true },
      { key: "team", name: "team", label: "Time", sortable: true },
      { key: "dateStart", name: "dateStart", label: "Data", sortable: true },
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
    addPlayer() {
      this.$router.push("/players/create");
    },
    editPlayer(id) {
      this.$router.push(`/players/edit/${id}`);
    },
    async deleteItems(ids) {
      try {
        this.loading = true;

        const query = gql`
          ${USERDELETE}
        `;

        const variables = {
          id: ids,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Usuário(s) deletado(s) com sucesso!", () => {
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

          confirmError("Ocorreu um erro ao deletar o usuário!", footer);
        } else {
          confirmError("Ocorreu um erro ao deletar o usuário!");
        }
      }
      this.loading = false;
    },

    formatTrainingDateStart(dateStart, dateEnd) {
      const startTime = moment(dateStart).format("HH:mm");
      const endTime = moment(dateEnd).format("HH:mm");
      return `${startTime} até ${endTime}`;
    },

    formatTrainingDate(dateStart) {
      const formattedDate = moment(dateStart).format("DD/MM/YYYY");
      return `${formattedDate}`;
    },

    async deletePlayer(id) {
      await this.deleteItems([id]);
    },

    async deletePlayers(items) {
      await this.deleteItems(items);
    },

    updateCurrentPageActive(page) {
      this.variablesGetTrainings.page = page;
      this.getTrainings();
    },

    searchPlayers(search) {
      this.variablesGetTrainings.filter.search = `%${search}%`;
    },

    clearSearch() {
      this.variablesGetTrainings.filter = {
        search: "%%",
        positionsIds: [],
        teamsIds: [],
      };
    },

    getTrainings() {
      console.log("ola mundo!");
      this.loading = true;
      this.items = [];

      const query = gql`
        ${TRAININGS}
      `;

      const consult = {
        ...this.variablesGetTrainings,
        filter: {
          ...this.variablesGetTrainings.filter,
        },
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        console.log("result", result);
        if (result?.data?.trainings?.data.length > 0) {
          this.paginatorInfo = result.data.trainings.paginatorInfo;
          this.items = result.data.trainings.data;
        }
      });

      if (value) {
        console.log("result", value);

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
