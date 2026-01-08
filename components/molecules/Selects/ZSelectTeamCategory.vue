<template>
  <ZSelect
    v-model="value"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    @click="getTeams(true)"
    @scroll-bottom="loadMore"
    @update-search="newSearch"
  />
</template>

<script>
import ZSelect from "~/components/atoms/Select/ZSelect";
import TEAM_CATEGORIES from "~/graphql/teamCategories/query/teamCategories.graphql";

export default {
  components: {
    ZSelect,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    ignoreIds: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      hasMoreItems: true,
      value: null,
      loading: false,
      items: [],
      variablesGetTeams: {
        page: 1,
        perPage: 10,
        filter: {
          search: "%%",
          ignoreIds: this.ignoreIds,
        },
      },
    };
  },

  watch: {
    ignoreIds(newVal) {
      this.variablesGetTeams.filter.ignoreIds = newVal.map((item) => {
        return Number(item);
      });
      this.getTeams();
    },
  },

  methods: {
    getTeams(click = false) {
      if (click) {
        this.items = [];
        this.variablesGetTeams.page = 1;
      }
      this.loading = true;

      setTimeout(() => {
        const query = gql`
          ${TEAM_CATEGORIES}
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
      if (result?.teamCategories?.data.length > 0) {
        this.paginatorInfo = result.teamCategories.paginatorInfo;

        const newItems = result.teamCategories.data.map((item) => {
          return {
            text: item.name,
            value: Number(item.id),
          };
        });

        const allItems = [...this.items, ...newItems];

        const uniqueItems = Array.from(
          new Set(allItems.map((a) => a.value))
        ).map((value) => {
          return allItems.find((a) => a.value === value);
        });

        this.items = uniqueItems;
        this.hasMoreItems = result.teamCategories.paginatorInfo.hasMorePages;
      } else {
        this.hasMoreItems = false;
      }
    },
    newSearch(newSearchValue) {
      this.variablesGetTeams.filter.search = `%${newSearchValue}%`;
      this.getTeams();
    },
    loadMore() {
      if (!this.hasMoreItems) {
        return;
      }
      this.variablesGetTeams.page += 1;
      this.getTeams();
    },
  },
};
</script>
