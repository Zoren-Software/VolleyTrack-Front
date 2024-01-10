<template>
  <ZSelect
    v-model="value"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    multiple
    @click="getSpecificFundamentals(true)"
    @scrollBottom="loadMore"
    @updateSearch="newSearch"
  />
</template>

<script>
import ZSelect from "~/components/atoms/Select/ZSelect";
import SPECIFICFUNDAMENTALS from "~/graphql/specificFundamental/query/specificFundamentals.graphql";

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
    fundamentalsIds: {
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
      variablesGetSpecificFundamentals: {
        page: 1,
        perPage: 10,
        filter: {
          search: "%%",
          userIds: this.userIds,
          fundamentalsIds: this.fundamentalsIds,
          ignoreIds: this.ignoreIds,
        },
      },
    };
  },

  watch: {
    fundamentalsIds(newVal) {
      this.variablesGetSpecificFundamentals.filter.fundamentalsIds = newVal.map(
        (item) => {
          return Number(item.value);
        }
      );
      this.getSpecificFundamentals();
    },
    userIds(newVal) {
      this.variablesGetSpecificFundamentals.filter.usersIds = newVal.map(
        (item) => Number(item.value)
      );
      this.getSpecificFundamentals();
    },
    ignoreIds(newVal) {
      this.variablesGetSpecificFundamentals.filter.ignoreIds = newVal.map(
        (item) => {
          return Number(item);
        }
      );
      this.getSpecificFundamentals();
    },
  },

  methods: {
    getSpecificFundamentals(click = false) {
      if (click) {
        this.items = [];
        this.variablesGetSpecificFundamentals.page = 1;
      }
      this.loading = true;

      setTimeout(() => {
        const query = gql`
          ${SPECIFICFUNDAMENTALS}
        `;

        this.variablesGetSpecificFundamentals.filter.fundamentalsIds =
          this.fundamentalsIds.map((item) => {
            return Number(item);
          });

        const {
          result: { value },
        } = useQuery(query, this.variablesGetSpecificFundamentals);

        const { onResult } = useQuery(
          query,
          this.variablesGetSpecificFundamentals
        );

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
      this.variablesGetSpecificFundamentals.filter.search = `%${newSearchValue}%`;
      this.getSpecificFundamentals();
    },
    loadMore() {
      if (!this.hasMoreItems) {
        return;
      }
      this.variablesGetSpecificFundamentals.page += 1;
      this.getSpecificFundamentals();
    },
  },
};
</script>
