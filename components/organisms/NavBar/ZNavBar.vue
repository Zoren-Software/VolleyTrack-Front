<template>
  <va-navbar
    color="background-primary"
    style="position: fixed; z-index: 1; width: 100%"
  >
    <template #left>
      <ZNavBarItemLogo
        :minimized="minimized"
        @toggleMinimize="toggleMinimize"
      />
    </template>
    <template #center>
      <div class="nav-links">
        <NuxtLink
          v-for="item in titles"
          :key="item.title"
          :to="item.link"
          :class="['nav-link', { active: item.active }]"
        >
          {{ item.title }}
        </NuxtLink>
      </div>
    </template>
    <template #right>
      <ZNavBarItemNotification />
      <ZNavBarItemUser :user="user" :firstLatter="firstLatter" />
      <ZNavBarItemSettings @menu-settings-minimize="onMenuSettingsMinimize" />
    </template>
  </va-navbar>
</template>

<script>
import ZNavBarItemLogo from "~/components/molecules/NavBar/ZNavBarItemLogo";
import ZNavBarItemNotification from "~/components/molecules/NavBar/ZNavBarItemNotification";
import ZNavBarItemUser from "~/components/molecules/NavBar/ZNavBarItemUser";
import ZNavBarItemSettings from "~/components/molecules/NavBar/ZNavBarItemSettings";
import ME from "~/graphql/user/query/me.graphql";

export default {
  components: {
    ZNavBarItemLogo,
    ZNavBarItemNotification,
    ZNavBarItemUser,
    ZNavBarItemSettings,
  },
  data() {
    return {
      titles: [
        { title: "Home", link: "/", active: false },
        { title: "Treinos", link: "/trainings", active: false },
        { title: "Times", link: "/teams", active: false },
        { title: "Jogadores", link: "/players", active: false },
      ],
      user: {
        id: null,
        name: "Usuário",
      },
    };
  },
  computed: {
    firstLatter() {
      return this.user.name.charAt(0).toUpperCase();
    },
  },
  watch: {
    $route() {
      this.updateActiveLinks();
    },
  },
  created() {
    this.updateActiveLinks();
    this.getUser();
  },
  mounted() {
    this.getUser();
  },
  methods: {
    updateActiveLinks() {
      this.titles.forEach((item) => {
        item.active = this.$route.path.startsWith(item.link);
      });
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

<style scoped>
.nav-links {
  display: flex;
  gap: 16px;
}

.nav-link {
  color: #e0e0e0;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #ffb366;
}

.nav-link.active {
  color: #e9742b;
}
</style>
