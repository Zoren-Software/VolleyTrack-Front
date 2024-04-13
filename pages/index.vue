<template>
  <div style="display: none">
    <h1>
      <!-- Mostrar aqui o token do usuario vindo de localstorage -->
      {{ token }}
      <pre>{{ JSON.stringify(user, null, 2) }}</pre>
    </h1>
  </div>
  <ZGettingStartedGuide
    :totalUsers="totalUsers"
    :totalTeams="totalTeams"
    :totalTrainings="totalTrainings"
  />
  <ZDashboardInitial
    :totalUsers="totalUsers"
    :totalTeams="totalTeams"
    :totalTrainings="totalTrainings"
  />
</template>

<script>
import ZGettingStartedGuide from "~/components/organisms/Dashboard/ZGettingStartedGuide.vue";
import ZDashboardInitial from "~/components/organisms/Dashboard/ZDashboardInitial.vue";
import PLAYERSTOTAL from "~/graphql/user/query/usersTotal.graphql";
import TEAMSTOTAL from "~/graphql/team/query/teamsTotal.graphql";
import TRAININGSTOTAL from "~/graphql/training/query/trainingsTotal.graphql";

export default {
  components: {
    ZGettingStartedGuide,
    ZDashboardInitial,
  },
  mounted() {
    this.getInformations();
    this.token = localStorage.getItem("userToken") ?? "sem token";
    this.user = JSON.parse(localStorage.getItem("user"));
  },

  data() {
    return {
      token: "",
      user: {},
      loading: false,
      totalUsers: 0,
      totalTeams: 0,
      totalTrainings: 0,
      paginatorInfo: {},
      variablesGetPlayers: {
        page: 1,
        filter: {
          search: "%%",
          positionsIds: [],
          teamsIds: [],
        },
        orderBy: "id",
        sortedBy: "desc",
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
    };
  },
  methods: {
    getInformations() {
      this.getPlayers({ fetchPolicy: "network-only" });
      this.getTeams({ fetchPolicy: "network-only" });
      this.getTrainings({ fetchPolicy: "network-only" });
    },

    getPlayers(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${PLAYERSTOTAL}
      `;

      let positionsIdsValues = this.variablesGetPlayers.filter.positionsIds.map(
        (position) => position.value
      );

      let teamsIdsValues = this.variablesGetPlayers.filter.teamsIds.map(
        (team) => team.value
      );

      const consult = {
        ...this.variablesGetPlayers,
        filter: {
          ...this.variablesGetPlayers.filter,
          positionsIds: positionsIdsValues,
          teamsIds: teamsIdsValues,
          rolesIds: [3],
        },
      };

      const {
        result: { value },
      } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando quer buscar nova consulta, senão 'cache-first'
      });

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.users?.paginatorInfo) {
          this.totalUsers = result?.data?.users?.paginatorInfo?.total;
        }
      });

      if (value) {
        if (value?.users?.paginatorInfo.total) {
          this.totalUsers = value?.users?.paginatorInfo.total;
        }
      }
      this.loading = false;
    },
    getTeams(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${TEAMSTOTAL}
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
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando quer buscar nova consulta, senão 'cache-first'
      });

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.teams?.paginatorInfo) {
          this.totalTeams = result?.data?.teams?.paginatorInfo?.total;
        }
      });

      if (value) {
        if (value?.teams?.paginatorInfo.total) {
          this.totalTeams = value?.teams?.paginatorInfo.total;
        }
      }
      this.loading = false;
    },
    getTrainings(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${TRAININGSTOTAL}
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

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando quer buscar nova consulta, senão 'cache-first'
      });

      onResult((result) => {
        if (result?.data?.trainings?.paginatorInfo) {
          this.totalTrainings = result?.data?.trainings?.paginatorInfo?.total;
        }
      });

      if (value) {
        if (value?.trainings?.paginatorInfo.total) {
          this.totalTrainings = value?.trainings?.paginatorInfo.total;
        }
      }
      this.loading = false;
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Home",
});
</script>
