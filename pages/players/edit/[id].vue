<template>
  <ZUserForm
    :data="data"
    @save="edit"
    :loading="loading"
    :errorFields="errorFields"
    :errors="errors"
  />
</template>

<script>
import ZUserForm from "~/components/organisms/Forms/User/ZUserForm";
import PLAYER from "~/graphql/user/query/user.graphql";
import { transformUserData } from "~/utils/forms/userForm";

export default {
  components: {
    ZUserForm,
  },
  mounted() {
    this.getPlayer();
  },
  data() {
    return {
      data: {},
      variablesGetPlayer: {
        id: this.$route.params.id,
      },
      loading: false,
      error: false,
      errorFields: [],
      errors: this.errorsDefault(),
    };
  },
  methods: {
    errorsDefault() {
      return {
        name: [],
        email: [],
        password: [],
        cpf: [],
        rg: [],
        phone: [],
        roleId: [],
        teamId: [],
      };
    },
    getPlayer() {
      this.loading = true;

      const query = gql`
        ${PLAYER}
      `;

      const consult = {
        ...this.variablesGetPlayer,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.user) {
          this.data = transformUserData(result.data.user);
        }
      });

      if (value) {
        if (value?.user) {
          this.data = transformUserData(value.user);
        }
      }

      this.loading = false;
    },
  },
};
</script>
