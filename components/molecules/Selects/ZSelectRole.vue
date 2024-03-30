<template>
  <ZSelect
    v-model="value"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    multiple
    @click="getRoles(true)"
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
import ROLES from "~/graphql/role/query/roles.graphql";

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
      value: "",
      loading: false,
      items: [],
      variablesGetRoles: {
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
      this.variablesGetRoles.filter.ignoreIds = newVal.map((item) => {
        return Number(item);
      });
      this.getRoles();
    },
  },

  methods: {
    getRoles(click = false) {
      if (click) {
        this.items = [];
        this.variablesGetRoles.page = 1;
      }
      this.loading = true;
      setTimeout(() => {
        const query = gql`
          ${ROLES}
        `;

        const {
          result: { value },
        } = useQuery(query, this.variablesGetRoles);

        const { onResult } = useQuery(query, this.variablesGetRoles);

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
      if (result?.roles?.data.length > 0) {
        this.paginatorInfo = result.roles.paginatorInfo;

        const newItems = result.roles.data.map((item) => {
          return {
            text: item.name,
            id: Number(item.id),
          };
        });

        let allItems = [...this.items, ...newItems];

        const uniqueItems = Array.from(new Set(allItems.map((a) => a.id))).map(
          (id) => {
            return allItems.find((a) => a.id === id);
          }
        );

        this.items = uniqueItems;
        this.hasMoreItems = result.roles.paginatorInfo.hasMorePages;
      } else {
        this.hasMoreItems = false;
      }
    },
    newSearch(newSearchValue) {
      this.variablesGetRoles.filter.search = `%${newSearchValue}%`;
      this.getRoles();
    },
    loadMore() {
      if (!this.hasMoreItems) {
        return;
      }
      this.variablesGetRoles.page += 1;
      this.getRoles();
    },
  },
};
</script>
