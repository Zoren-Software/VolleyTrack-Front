<template>
  <va-navbar-item>
    <va-button-dropdown color="background-primary">
      <template #label>
        <va-inner-loading :loading="loading" :size="50">
          <va-avatar v-if="user.id" size="small" class="mr-6">
            {{ firstLatter }}
          </va-avatar>
          <va-icon v-else name="account_circle" />
        </va-inner-loading>
      </template>
      <ZListItemsUser :actionsUser="actionsUser" @action="actionHandler" />
    </va-button-dropdown>
    <div v-for="role in user.roles">{{ role.name }}</div>
  </va-navbar-item>
</template>

<script>
import ZButtonDropdown from "~/components/atoms/Buttons/ZButtonDropdown";
import ZAvatar from "~/components/atoms/Avatar/ZAvatar";
import ZIcon from "~/components/atoms/Icons/ZIcon";
import ZListItemsUser from "~/components/molecules/List/ZListItemsUser";
import ME from "~/graphql/user/query/me.graphql";

export default {
  name: "ZNavbarItemUser",
  components: {
    ZListItemsUser,
    ZButtonDropdown,
    ZAvatar,
    ZIcon,
  },
  data() {
    return {
      loading: true,
      user: {
        id: null,
        name: "Usuário",
      },
      actionsUser: [
        {
          title: "Minha conta",
          action: "account",
          active: false,
        },
        {
          title: "Logout",
          action: "logout",
          active: false,
        },
      ],
    };
  },
  computed: {
    firstLatter() {
      return this.user.name.charAt(0).toUpperCase();
    },
  },

  mounted() {
    this.loading = true;
    setTimeout(() => {
      this.getUser();
      this.loading = false;
    }, 2000);
  },

  methods: {
    actionHandler(type) {
      if (type === "account") {
        this.$router.push("/account");
      } else if (type === "logout") {
        this.logout();
      }
    },

    logout() {
      const { onLogout } = useApollo();
      onLogout();
      localStorage.removeItem("userToken");
      this.$router.push("/login");
    },

    async getUser() {
      if (localStorage.getItem("user")) {
        this.user = await JSON.parse(localStorage.getItem("user"));
      } else {
        const query = gql`
          ${ME}
        `;
        const {
          data: { value },
        } = await useAsyncQuery(query, {});

        if (value?.me) {
          this.user = value.me;
          localStorage.setItem("user", JSON.stringify(this.user));
        }
      }
    },
  },
};
</script>

<style>
.logo {
  font-weight: 600;
  font-size: 1.5rem;
}

.va-navbar__left {
  justify-content: initial !important;
  align-items: center !important;
}

.va-navbar__right {
  justify-content: end !important;
  align-items: center !important;
}

@media (max-width: 767.98px) {
  .va-navbar {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 4rem !important;
    padding: 0px 15px 0px 15px !important;
  }
}
</style>
