<template>
  <div style="max-width: 300px">
    <ZSelect v-model="value" v-bind="$attrs" :label="label" :options="items" />
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
    };
  },
  mounted() {
    this.getPositions();
  },
  methods: {
    getPositions() {
      this.loading = true;

      const query = gql`
        ${POSITIONS}
      `;

      const {
        result: { value },
      } = useQuery(query, this.variablesGetPositions);

      const { onResult } = useQuery(query, this.variablesGetPositions);

      onResult((result) => {
        console.log(result);
        if (result?.data?.positions?.data.length > 0) {
          this.paginatorInfo = result.data.positions.paginatorInfo;
          this.items = result.data.positions.data.map((item) => {
            return {
              text: item.name,
              textBy: `Text by ${item.name}`,
              value: item.id,
              valueBy: item.name.toLowerCase(),
            };
          });
        }
      });

      if (value) {
        console.log(value);
        if (value?.positions?.data.length > 0) {
          this.paginatorInfo = value.positions.paginatorInfo;
          this.items = value.positions.data.map((item) => {
            return {
              text: item.name,
              textBy: `Text by ${item.name}`,
              value: item.id,
              valueBy: item.name.toLowerCase(),
            };
          });
        }
      }
      this.loading = false;
    },
  },
};
</script>
