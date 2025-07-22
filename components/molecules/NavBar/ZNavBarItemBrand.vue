<template>
  <ZNavBarItem class="logo">
    <div class="icon-container">
      <va-icon name="sports_volleyball" color="#E9742B" size="20px" />
    </div>
    <span class="ml-2">{{ applicationName }} | {{ items.nameTenant }}</span>
  </ZNavBarItem>
</template>

<script>
import ZNavBarItem from "~/components/atoms/NavBar/ZNavBarItem";
import SETTING from "~/graphql/setting/query/setting.graphql";

const runtimeConfig = useRuntimeConfig();
const applicationName = runtimeConfig.public.nameApplication;

export default {
  mounted() {
    this.getSettings();
  },
  data: () => ({
    applicationName,
    loading: false,
    items: {},
  }),
  components: {
    ZNavBarItem,
  },

  methods: {
    getSettings() {
      this.loading = true;

      const query = gql`
        ${SETTING}
      `;

      const consult = {
        id: 1,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.config) {
          this.items = result.data.config;
        }
      });

      if (value) {
        if (value?.data) {
          this.items = value.data.config;
        }
      }
      this.loading = false;
    },
  },
};
</script>

<style>
.logo {
  font-weight: 600;
  font-size: 1.5rem;
}

.icon-container {
  background-color: #FFF4EC;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #FFE3D1; /* Borda sutil opcional */
}
</style>
