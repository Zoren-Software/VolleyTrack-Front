<template>
  <ZSelect
    v-model="value"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    multiple
    @click="getFundamentals(true)"
    @scrollBottom="loadMore"
    @updateSearch="newSearch"
  />
</template>

<script>
import ZSelect from "~/components/atoms/Select/ZSelect";
import FUNDAMENTALS from "~/graphql/fundamental/query/fundamentals.graphql";

export default {
  components: {
    ZSelect,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    userIds: {
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
      variablesGetFundamentals: {
        page: 1,
        perPage: 10,
        filter: {
          search: "%%",
          userIds: this.userIds,
          ignoreIds: this.ignoreIds,
        },
      },
    };
  },

  watch: {
    userIds(newVal) {
      this.variablesGetFundamentals.filter.usersIds = newVal.map((item) =>
        Number(item.value)
      );
      this.getFundamentals();
    },
    ignoreIds(newVal) {
      this.variablesGetFundamentals.filter.ignoreIds = newVal.map((item) => {
        return Number(item);
      });
      this.getFundamentals();
    },
  },

  methods: {
    getFundamentals(click = false) {
      if (click) {
        this.items = [];
        this.variablesGetFundamentals.page = 1;
      }
      this.loading = true;

      setTimeout(() => {
        const query = gql`
          ${FUNDAMENTALS}
        `;

        const {
          result: { value },
        } = useQuery(query, this.variablesGetFundamentals);

        const { onResult } = useQuery(query, this.variablesGetFundamentals);

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
      if (result?.fundamentals?.data.length > 0) {
        this.paginatorInfo = result.fundamentals.paginatorInfo;

        const newItems = result.fundamentals.data.map((item) => {
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
        this.hasMoreItems = result.fundamentals.paginatorInfo.hasMorePages;
      } else {
        this.hasMoreItems = false;
      }
    },
    newSearch(newSearchValue) {
      this.variablesGetFundamentals.filter.search = `%${newSearchValue}%`;
      this.getFundamentals();
    },
    loadMore() {
      if (!this.hasMoreItems) {
        return;
      }
      this.variablesGetFundamentals.page += 1;
      this.getFundamentals();
    },
  },
};
</script>
