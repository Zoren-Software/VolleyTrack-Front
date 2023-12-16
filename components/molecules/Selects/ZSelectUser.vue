<template>
  <ZSelect
    v-model="value"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    multiple
    @click="getUsers(true)"
    @scrollBottom="loadMore"
    @updateSearch="newSearch"
  >
    <template #option="{ option, index, selectOption }">
      <VaButton
        size="small"
        preset="primary"
        text-color="#000000"
        class="responsive-option"
        @click="selectOption(option)"
      >
        <ZUser :data="option" />
      </VaButton>
    </template>
    <template #content="{ value }">
      <va-chip
        v-if="value.length >= 1"
        v-for="chip in value.slice(0, 3)"
        :key="chip.value"
        class="mr-2"
        size="small"
      >
        {{ chip.name }}
      </va-chip>
    </template>
  </ZSelect>
</template>

<script>
import ZSelect from "~/components/atoms/Select/ZSelect";
import USERS from "~/graphql/user/query/users.graphql";
import ZUser from "~/components/molecules/Selects/Slots/ZUser";

export default {
  components: {
    ZSelect,
    ZUser,
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
      variablesGetUsers: {
        page: 1,
        perPage: 10,
        filter: {
          search: "%%",
          ignoreIds: this.ignoreIds,
        },
      },
    };
  },

  methods: {
    getUsers(click = false) {
      if (click) {
        this.items = [];
        this.variablesGetUsers.page = 1;
      }
      this.loading = true;

      setTimeout(() => {
        const query = gql`
          ${USERS}
        `;

        const {
          result: { value },
        } = useQuery(query, this.variablesGetUsers);

        const { onResult } = useQuery(query, this.variablesGetUsers);

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
      if (result?.users?.data.length > 0) {
        this.paginatorInfo = result.users.paginatorInfo;

        const newItems = result.users.data.map((item) => {
          return {
            text: item.name,
            value: Number(item.id),
            ...item,
          };
        });

        let allItems = [...this.items, ...newItems];

        const uniqueItems = Array.from(
          new Set(allItems.map((a) => a.value))
        ).map((value) => {
          return allItems.find((a) => a.value === value);
        });

        this.items = uniqueItems;
        this.hasMoreItems = result.users.paginatorInfo.hasMorePages;
      } else {
        this.hasMoreItems = false;
      }
    },
    async newSearch(newSearchValue) {
      this.variablesGetUsers.filter.search = await `%${newSearchValue}%`;
      await this.getUsers();
    },
    loadMore() {
      if (!this.hasMoreItems) {
        return;
      }
      this.variablesGetUsers.page += 1;
      this.getUsers();
    },
  },
};
</script>

<style scoped>
.responsive-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem;
  padding-left: 1rem;
  padding-bottom: 4rem;
}
</style>
