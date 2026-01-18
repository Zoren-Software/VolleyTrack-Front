<template>
  <ZSelect
    v-model="internalValue"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    multiple
    return-object
    @click="getTeams(true)"
    @scroll-bottom="loadMore"
    @update-search="newSearch"
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
    modelValue: {
      type: [Array, Object],
      default: () => [],
    },
    label: {
      type: String,
      required: true,
    },
    positionsIds: {
      type: Array,
      required: false,
    },
    ignoreIds: {
      type: Array,
      required: false,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      hasMoreItems: true,
      loading: false,
      items: [],
      variablesGetTeams: {
        page: 1,
        perPage: 10,
        filter: {
          search: "%%",
          positionsIds: this.positionsIds,
          ignoreIds: this.ignoreIds,
        },
      },
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue || [];
      },
      set(newValue) {
        this.$emit("update:modelValue", newValue);
      },
    },
  },

  watch: {
    positionsIds(newVal) {
      this.variablesGetTeams.filter.positionsIds = newVal.map((item) =>
        Number(item.value)
      );
      this.getTeams();
    },
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

        const allItems = [...this.items, ...newItems];

        const uniqueItems = Array.from(
          new Set(allItems.map((a) => a.value))
        ).map((value) => {
          return allItems.find((a) => a.value === value);
        });

        this.items = uniqueItems;
        this.hasMoreItems = result.teams.paginatorInfo.hasMorePages;
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
    // Método helper para buscar um item pelo valor
    getItemByValue(value) {
      return this.items.find((item) => item.value === value);
    },
  },
};
</script>
