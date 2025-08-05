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
    @actionSearch="getTeams"
    @actionClear="clearSearch"
    @add="addTeam"
    @edit="editTeam"
    @delete="deleteTeam"
    @deletes="deleteTeams"
    @update:currentPageActive="updateCurrentPageActive"
  >
    <!-- FILTER -->
    <template #filter>
      <div class="row">
        <div class="flex flex-col md6 mb-2">
          <div class="item mr-2">
            <ZSelectPosition
              label="Posições"
              placeholder="Selecione uma posição"
              v-model="variablesGetTeams.filter.positionsIds"
              :teamsIds="variablesGetTeams.filter.teamsIds"
            />
          </div>
        </div>
        <div class="flex flex-col md6 mb-2">
          <div class="item mr-2">
            <ZSelectUser
              label="Usuário Alteração"
              placeholder="Selecione um usuário"
              v-model="variablesGetTeams.filter.usersIds"
            />
          </div>
        </div>
        <div class="flex flex-col md6 mb-2">
          <div class="item mr-2">
            <ZSelectUser
              label="Jogadores"
              placeholder="Selecione um jogador"
              v-model="variablesGetTeams.filter.playersIds"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- CELL -->
    <template #cell(team)="{ rowKey }">
      <ZTeam :data="rowKey" />
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
import TEAMS from "~/graphql/team/query/teams.graphql";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZSelectPosition from "~/components/molecules/Selects/ZSelectPosition";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import ZDateTraining from "~/components/molecules/Datatable/Slots/ZDateTraining";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam";
import TEAMDELETE from "~/graphql/team/mutation/teamDelete.graphql";
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
    this.getTeams();
  },

  data() {
    let loading = false;

    const columns = [
      { key: "team", name: "team", label: "Time", sortable: false },
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
      variablesGetTeams: {
        page: 1,
        filter: {
          usersIds: [],
          playersIds: [],
          positionsIds: [],
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
    addTeam() {
      this.$router.push("/teams/create");
    },
    editTeam(id) {
      this.$router.push(`/teams/edit/${id}`);
    },
    async deleteItems(ids) {
      try {
        this.loading = true;

        const query = gql`
          ${TEAMDELETE}
        `;

        const variables = {
          id: ids,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Time(s) deletado(s) com sucesso!", () => {
          this.items = this.items.filter((item) => !ids.includes(item.id));
        });

        this.getTeams({ fetchPolicy: "network-only" });
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

    async deleteTeam(id) {
      await this.deleteItems([id]);
    },

    async deleteTeams(items) {
      await this.deleteItems(items);
    },

    updateCurrentPageActive(page) {
      this.variablesGetTeams.page = page;
      this.getTeams();
    },

    searchTrainings(search) {
      this.variablesGetTeams.filter.search = `%${search}%`;
    },

    clearSearch() {
      this.variablesGetTeams.filter = {
        search: "%%",
        teamsIds: [],
      };
    },

    getTeams(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${TEAMS}
      `;

      let positionsIdsValues = this.variablesGetTeams.filter.positionsIds.map(
        (position) => position.value
      );

      let usersIdsValues = this.variablesGetTeams.filter.usersIds.map(
        (user) => user.value
      );

      let playersIdsValues = this.variablesGetTeams.filter.playersIds.map(
        (player) => player.value
      );

      const consult = {
        ...this.variablesGetTeams,
        filter: {
          ...this.variablesGetTeams.filter,
          positionsIds: positionsIdsValues,
          usersIds: usersIdsValues,
          playersIds: playersIdsValues,
        },
      };

      const {
        result: { value },
      } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first",
      });

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.teams?.data.length > 0) {
          this.paginatorInfo = result.data.teams.paginatorInfo;
          this.items = result.data.teams.data.map((team) => ({
            ...team,
            teamCategory: team.teamCategory || { name: "Sem Categoria" },
            teamLevel: team.teamLevel || { name: "Sem Nível Técnico" },
          }));
        }
      });

      if (value) {
        if (value?.teams?.data.length > 0) {
          this.paginatorInfo = value.teams.paginatorInfo;
          this.items = value.teams.data.map((team) => ({
            ...team,
            teamCategory: team.teamCategory || { name: "Sem Categoria" },
            teamLevel: team.teamLevel || { name: "Sem Nível Técnico" },
          }));
        }
      }
      this.loading = false;
    },
  },
});
</script>
