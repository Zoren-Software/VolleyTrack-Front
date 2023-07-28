<template>
  <div style="margin-top: 9vh">
    <va-navbar color="background-primary" style="position: fixed; z-index: 999">
      <template #left>
        <ZNavBarItemLogo
          :minimized="minimized"
          @toggleMinimize="toggleMinimize"
        />
        <ZNavBarItemTitle :title="activeTitle" />
      </template>
      <template #center>
        <ZNavBarItemBrand />
      </template>
      <template #right>
        <ZNavBarItemReport />
        <ZNavBarItemNotification />
        <ZNavBarItemUser :user="user" :firstLatter="firstLatter" />
        <ZNavBarItemSettings />
      </template>
    </va-navbar>
  </div>
</template>

<script>
import ZNavBarItemLogo from "~/components/molecules/NavBar/ZNavBarItemLogo";
import ZNavBarItemTitle from "~/components/molecules/NavBar/ZNavBarItemTitle";
import ZNavBarItemBrand from "~/components/molecules/NavBar/ZNavBarItemBrand";
import ZNavBarItemReport from "~/components/molecules/NavBar/ZNavBarItemReport";
import ZNavBarItemNotification from "~/components/molecules/NavBar/ZNavBarItemNotification";
import ZNavBarItemUser from "~/components/molecules/NavBar/ZNavBarItemUser";
import ZNavBarItemSettings from "~/components/molecules/NavBar/ZNavBarItemSettings";
import ME from "~/graphql/user/query/me.graphql";

export default {
  components: {
    ZNavBarItemLogo,
    ZNavBarItemTitle,
    ZNavBarItemBrand,
    ZNavBarItemReport,
    ZNavBarItemNotification,
    ZNavBarItemUser,
    ZNavBarItemSettings,
  },

  emits: ["toggleMinimize"],

  data() {
    return {
      minimized: false,
      titles: [
        { title: "Home", link: "/", active: false },
        { title: "Treinos", link: "/trainings", active: false },
        { title: "Times", link: "/teams", active: false },
        { title: "Jogadores", link: "/players", active: false },
        { title: "Criar Jogador", link: "/players/create", active: false },
        { title: "Login", link: "/login", active: false },
        { title: "Minha Conta", link: "/account", active: false },
        { title: "Notificações", link: "/notifications", active: false },
        { title: "Configurações", link: "/settings", active: false },
      ],
      user: {
        id: null,
        name: "Usuário",
      },
    };
  },

  computed: {
    activeTitle() {
      return this.titles.find((title) => title.active).title;
    },
    computedTitles() {
      return this.titles.map((title) => {
        title.active = this.$route.path === title.link;
        return title;
      });
    },
    firstLatter() {
      return this.user.name.charAt(0).toUpperCase();
    },
  },

  watch: {
    $route() {
      this.computedTitles;
    },
  },

  created() {
    this.computedTitles;
    this.getUser();
  },

  mounted() {
    this.getUser();
  },

  methods: {
    toggleMinimize() {
      this.minimized = !this.minimized;
      this.$emit("toggleMinimize", this.minimized);
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
