<template>
  <ZUserForm :data="data" />
  {{ data }}
</template>

<script>
import ZUserForm from "~/components/organisms/Forms/User/ZUserForm";
import PLAYER from "~/graphql/user/query/user.graphql";

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
    };
  },
  methods: {
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
        console.log(result);

        if (result?.data?.user) {
          console.log("==========>", result.data.user.positions);

          this.data = {
            ...result.data.user,
            positions: result.data.user.positions.map((position) => {
              return {
                id: Number(position.id),
                position: position.name,
              };
            }),
            teams: result.data.user.teams.map((team) => {
              return {
                id: Number(team.id),
                team: team.name,
              };
            }),
            roles: result.data.user.roles.map((role) => {
              return {
                id: Number(role.id),
                text: role.name,
              };
            }),
            phone: result.data.user?.information?.phone,
            cpf: result.data.user?.information?.cpf,
            rg: result.data.user?.information?.rg,
            password: "",
            confirmPassword: "",
          };
        }
      });

      if (value) {
        if (value?.user) {
          this.data = {
            ...value.user,
            positions: value.user.positions.map((position) => {
              return {
                id: Number(position.id),
                position: position.name,
              };
            }),
            teams: value.user.teams.map((team) => {
              return {
                id: Number(team.id),
                team: team.name,
              };
            }),
            roles: value.user.roles.map((role) => {
              return {
                id: Number(role.id),
                text: role.name,
              };
            }),
            phone: value.user?.information?.phone,
            cpf: value.user?.information?.cpf,
            rg: value.user?.information?.rg,
            password: "",
            confirmPassword: "",
          };
        }
      }
      this.loading = false;
    },
  },
};
</script>
