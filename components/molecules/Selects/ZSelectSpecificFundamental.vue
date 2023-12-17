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
import SPECIFICFUNDAMENTAL from "~/graphql/specificFundamental/query/specificFundamentals.graphql";

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
      this.getTeams();
    },
    ignoreIds(newVal) {
      this.variablesGetFundamentals.filter.ignoreIds = newVal.map((item) => {
        return Number(item);
      });
      this.getTeams();
    },
  },

  methods: {
    getTeams(click = false) {
      if (click) {
        this.items = [];
        this.variablesGetFundamentals.page = 1;
      }
      this.loading = true;

      setTimeout(() => {
        const query = gql`
          ${SPECIFICFUNDAMENTAL}
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
      if (result?.specificFundamentals?.data.length > 0) {
        this.paginatorInfo = result.specificFundamentals.paginatorInfo;

        const newItems = result.specificFundamentals.data.map((item) => {
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
        this.hasMoreItems =
          result.specificFundamentals.paginatorInfo.hasMorePages;
      } else {
        this.hasMoreItems = false;
      }
    },
    newSearch(newSearchValue) {
      this.variablesGetFundamentals.filter.search = `%${newSearchValue}%`;
      this.getTeams();
    },
    loadMore() {
      if (!this.hasMoreItems) {
        return;
      }
      this.variablesGetFundamentals.page += 1;
      this.getTeams();
    },
  },
};
</script>
