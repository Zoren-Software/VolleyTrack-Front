<template>
  <ZSelect
    v-model="value"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    @click="getLanguages(true)"
    @scrollBottom="loadMore"
    @updateSearch="newSearch"
  />
</template>

<script>
import ZSelect from "~/components/atoms/Select/ZSelect";
import LANGUAGES from "~/graphql/language/query/languages.graphql";

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
      variablesGetLanguages: {
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
    value(newValue) {
      console.log(newValue);
      if (newValue && newValue.value) {
        // Verifique se o valor já está nas opções, se não, carregue ou ajuste as opções
        if (!this.items.some((item) => item.value === newValue.value)) {
          this.getLanguages();
        }
      }
    },
    ignoreIds(newVal) {
      this.variablesGetLanguages.filter.ignoreIds = newVal.map((item) => {
        return Number(item);
      });
      this.getLanguages();
    },
  },

  methods: {
    getLanguages(click = false) {
      if (click) {
        this.items = [];
        this.variablesGetLanguages.page = 1;
      }
      this.loading = true;

      setTimeout(() => {
        const query = gql`
          ${LANGUAGES}
        `;

        const {
          result: { value },
        } = useQuery(query, this.variablesGetLanguages);

        const { onResult } = useQuery(query, this.variablesGetLanguages);

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
      if (result?.languages?.data.length > 0) {
        this.paginatorInfo = result.languages.paginatorInfo;

        const newItems = result.languages.data.map((item) => {
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
        this.setInitialValue();
        this.hasMoreItems = result.languages.paginatorInfo.hasMorePages;
      } else {
        this.hasMoreItems = false;
      }
    },
    setInitialValue() {
      if (this.form && this.form.language) {
        const initialValue = this.items.find(
          (item) => item.value === this.form.language.value
        );
        if (initialValue) {
          this.value = initialValue;
        }
      }
    },
    newSearch(newSearchValue) {
      this.variablesGetLanguages.filter.search = `%${newSearchValue}%`;
      this.getLanguages();
    },
    loadMore() {
      if (!this.hasMoreItems) {
        return;
      }
      this.variablesGetLanguages.page += 1;
      this.getLanguages();
    },
  },
};
</script>
