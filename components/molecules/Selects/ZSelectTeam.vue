<template>
  <ZSelect
    v-model="value"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    multiple
    @click="getTeams"
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
  },
  data() {
    return {
      value: "",
      loading: false,
      items: [],
      variablesGetTeams: {
        page: 1,
        perPage: 10,
        filter: {
          search: "%%",
        },
      },
    };
  },

  methods: {
    getTeams() {
      this.loading = true;
      console.log("getTeams");

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
            textBy: `Text by ${item.name}`,
            value: item.id,
            valueBy: item.id,
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
