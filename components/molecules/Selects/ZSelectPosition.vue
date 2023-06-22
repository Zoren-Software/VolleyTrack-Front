<template>
  <div style="max-width: 300px">
    <ZSelect
      v-model="value"
      v-bind="$attrs"
      :label="label"
      :options="items"
      :loading="loading"
      multiple
      @click="getPositions"
      @scrollBottom="loadMore"
    >
      <template #content="{ value }">
        <va-chip
          v-if="value.length >= 2"
          v-for="chip in value.slice(0, 3)"
          :key="chip.value"
          class="mr-1 my-1 py-3"
          size="small"
        >
          {{ chip.text }}
        </va-chip>
      </template>
    </ZSelect>
  </div>
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
  },
  data() {
    return {
      value: "",
      loading: false,
      items: [],
      variablesGetPositions: {
        page: 1,
        perPage: 10,
        filter: {
          search: "",
        },
      },
    };
  },

  methods: {
    getPositions() {
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
      }, 300);
    },

    handleResult(result) {
      if (result?.positions?.data.length > 0) {
        this.paginatorInfo = result.positions.paginatorInfo;

        const newItems = result.positions.data.map((item) => {
          return {
            text: item.name,
            textBy: `Text by ${item.name}`,
            value: item.id,
            valueBy: item.name.toLowerCase(),
          };
        });

        let allItems = [...this.items, ...newItems];

        const uniqueItems = Array.from(
          new Set(allItems.map((a) => a.value))
        ).map((value) => {
          return allItems.find((a) => a.value === value);
        });

        this.items = uniqueItems;
      }
    },
    loadMore() {
      this.variablesGetPositions.page += 1;
      this.getPositions();
    },
  },
};
</script>
