<template>
  <ZSelect
    v-model="value"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    multiple
    @click="getPositions(true)"
    @scrollBottom="loadMore"
    @updateSearch="newSearch"
  >
    <template #content="{ value }">
      <va-chip
        v-if="value.length >= 2"
        v-for="chip in value.slice(0, 3)"
        :key="chip.value"
        class="mr-2"
        size="small"
      >
        {{ chip.text }}
      </va-chip>
    </template>
  </ZSelect>
</template>

<script>
import ZSelect from "~/components/atoms/Select/ZSelect";
import POSITIONS from "~/graphql/position/query/positions.graphql";

export default {
  components: {
    ZSelect,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    teamsIds: {
      type: Array,
      required: false,
    },
    ignoreIds: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      hasMoreItems: true,
      value: [],
      loading: false,
      items: [],
      variablesGetPositions: {
        page: 1,
        perPage: 10,
        filter: {
          search: "%%",
          teamsIds: this.teamsIds,
          ignoreIds: this.ignoreIds,
        },
      },
    };
  },
  watch: {
    teamsIds(newVal) {
      this.variablesGetPositions.filter.teamsIds = newVal.map((item) =>
        Number(item.value)
      );
      this.getPositions();
    },
    ignoreIds(newVal) {
      this.variablesGetPositions.filter.ignoreIds = newVal.map((item) => {
        return Number(item);
      });
      this.getPositions();
    },
  },

  methods: {
    getPositions(click = false) {
      if (click) {
        this.items = [];
        this.variablesGetPositions.page = 1;
      }
      this.loading = true;
      setTimeout(() => {
        const query = gql`
          ${POSITIONS}
        `;

        const {
          result: { value },
        } = useQuery(query, this.variablesGetPositions);

        const { onResult } = useQuery(query, this.variablesGetPositions);

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
      if (result?.positions?.data.length > 0) {
        this.paginatorInfo = result.positions.paginatorInfo;

        const newItems = result.positions.data.map((item) => {
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
        this.hasMoreItems = result.positions.paginatorInfo.hasMorePages;
      } else {
        this.hasMoreItems = false;
      }
    },
    newSearch(newSearchValue) {
      this.variablesGetPositions.filter.search = `%${newSearchValue}%`;
      this.getPositions();
    },
    loadMore() {
      if (!this.hasMoreItems) {
        return;
      }
      this.variablesGetPositions.page += 1;
      this.getPositions();
    },
  },
};
</script>
