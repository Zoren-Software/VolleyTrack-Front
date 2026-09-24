<template>
  <ZSelect
    v-model="selectValue"
    v-bind="$attrs"
    class="z-select-user"
    :label="label"
    :options="items"
    :loading="loading"
    multiple
    @click="getUsers(true)"
    @scrollBottom="loadMore"
    @updateSearch="newSearch"
  >
    <template #option="{ option, index, selectOption }">
      <button
        type="button"
        class="z-select-user-option"
        :class="{
          'z-select-user-option--selected': isUserSelected(option),
        }"
        @click="selectOption(option)"
      >
        <ZUser :data="option" />
      </button>
    </template>
    <template #content="{ value }">
      <div v-if="value?.length" class="z-select-user-selected">
        <span
          v-for="chip in value"
          :key="chip.value"
          class="z-select-user-chip"
        >
          {{ chip.name }}
        </span>
      </div>
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
    modelValue: {
      type: Array,
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
    rolesIds: {
      type: Array,
      required: false,
      default: () => [],
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
      variablesGetUsers: {
        page: 1,
        perPage: 10,
        filter: {
          search: "%%",
          ignoreIds: this.ignoreIds,
          rolesIds: this.rolesIds || [],
        },
      },
    };
  },

  computed: {
    selectValue: {
      get() {
        return this.modelValue ?? [];
      },
      set(v) {
        this.$emit("update:modelValue", Array.isArray(v) ? v : []);
      },
    },
  },

  methods: {
    isUserSelected(option) {
      const id = option?.value;
      if (id == null) return false;
      return (this.selectValue || []).some(
        (s) => Number(s?.value) === Number(id)
      );
    },
    getUsers(click = false) {
      if (click) {
        this.items = [];
        this.variablesGetUsers.page = 1;
      }
      this.loading = true;

      // Atualizar rolesIds no filtro - transformar para array de IDs
      const rolesIdsValues =
        this.rolesIds?.map((role) => role?.value || role?.id || role) || [];

      const consult = {
        ...this.variablesGetUsers,
        filter: {
          ...this.variablesGetUsers.filter,
          rolesIds: rolesIdsValues,
        },
      };

      setTimeout(() => {
        const query = gql`
          ${USERS}
        `;

        const {
          result: { value },
        } = useQuery(query, consult);

        const { onResult } = useQuery(query, consult);

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
      this.variablesGetUsers.page = 1;
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
.z-select-user-option {
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  font: inherit;
  text-align: left;
  padding: 12px 14px;
  margin: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #ffffff;
  color: inherit;
  transition: background-color 0.15s ease;
  min-height: 0;
}

.z-select-user-option:hover {
  background-color: #fff4ec;
}

.z-select-user-option--selected {
  background-color: #fff4ec !important;
  box-shadow: inset 0 0 0 1px rgba(255, 78, 27, 0.18);
}

.z-select-user-option--selected:hover {
  background-color: #ffe8d9 !important;
}

.z-select-user-option--selected :deep(.user-avatar--initial) {
  background: #ff4e1b !important;
  color: #ffffff !important;
  border-color: #ffffff !important;
  box-shadow: 0 1px 3px rgba(255, 78, 27, 0.25);
}

.z-select-user-option--selected :deep(.va-avatar__content) {
  color: #ffffff !important;
}

.z-select-user-option:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: -2px;
}

.z-select-user :deep(.va-dropdown__content) {
  background: #ffffff !important;
}

.z-select-user :deep(.va-select-dropdown__content) {
  background: #ffffff !important;
}

.z-select-user :deep([class*="dropdown"][class*="content"]) {
  background: #ffffff !important;
}

.z-select-user :deep(li) {
  margin: 0 0 6px;
  padding: 0;
  list-style: none;
  background: transparent;
}

.z-select-user :deep(li:last-child) {
  margin-bottom: 0;
}

.z-select-user :deep(ul) {
  padding: 6px 0;
  gap: 0;
}

/* Selecionados: estilo chip (como antes), borda laranja + fundo laranja claro */
.z-select-user-selected {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.z-select-user-chip {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 4px 12px;
  border: 1px solid #ff4e1b;
  border-radius: 999px;
  background: #ff4e1b;
  box-shadow: 0 1px 2px rgba(255, 78, 27, 0.35);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.z-select-user :deep(.va-select-content__selected) {
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
</style>
