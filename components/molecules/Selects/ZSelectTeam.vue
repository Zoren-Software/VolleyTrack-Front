<template>
  <ZSelect
    v-model="value"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    multiple
    @click="getTeams(true)"
    @scrollBottom="loadMore"
    @updateSearch="newSearch"
  />
</template>

<script>
import ZSelect from "~/components/atoms/Select/ZSelect";
import TEAMS from "~/graphql/team/query/teams.graphql";

export default {
  components: {
    ZSelect,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    positionsIds: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      value: [],
      loading: false,
      items: [],
      variablesGetTeams: {
        page: 1,
        perPage: 10,
        filter: {
          search: "%%",
          positionsIds: this.positionsIds,
        },
      },
    };
  },

  watch: {
    positionsIds(newVal) {
      this.variablesGetTeams.filter.positionsIds = newVal.map((item) =>
        Number(item.value)
      );
      this.getTeams();
    },
  },

  methods: {
    getTeams(click = false) {
      if (click) {
        this.items = [];
      }
      this.loading = true;

      setTimeout(() => {
        const query = gql`
          ${TEAMS}
        `;

        const {
          result: { value },
        } = useQuery(query, this.variablesGetTeams);

        const { onResult } = useQuery(query, this.variablesGetTeams);

        onResult((result) => {
          this.handleResult(result.data);
        });

        if (value) {
          this.handleResult(value);
        }

        this.loading = false;
      }, 400);
    },

    handleResult(result) {
      if (result?.teams?.data.length > 0) {
        this.paginatorInfo = result.teams.paginatorInfo;

        const newItems = result.teams.data.map((item) => {
          return {
            text: item.name,
            value: Number(item.id),
          };
        });

        let allItems = [...this.items, ...newItems];

        const uniqueItems = Array.from(
          new Set(allItems.map((a) => a.value))
        ).map((value) => {
          return allItems.find((a) => a.value === value);
        });

        this.items = uniqueItems;
      }
    },
    newSearch(newSearchValue) {
      this.variablesGetTeams.filter.search = `%${newSearchValue}%`;
      this.getTeams();
    },
    loadMore() {
      this.variablesGetTeams.page += 1;
      this.getTeams();
    },
  },
};
</script>
