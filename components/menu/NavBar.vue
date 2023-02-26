<template>
  <va-navbar color="primary">
    <template 
      class=""
      #left
    >
      <va-navbar-item class="logo">
        <va-icon @click="toggleMinimize" class="ml-2" :name="minimized ? `menu` : `menu_open`" />
      </va-navbar-item>
      <va-navbar-item 
        class="mr-5"
      >
        <h4 class="va-h4">{{ activeTitle }}</h4>
      </va-navbar-item>
    </template>
    <template #center>
      <va-navbar-item class="logo">
        <va-icon name="sports_volleyball" />
        <span class="ml-2">VoleiClub</span>
      </va-navbar-item>
    </template>
    <template #right>
      <va-navbar-item>
        <va-popover
          class="mr-2 mb-2"
          message="Reporte um problema ou sugestão"
        >
          <va-button href="https://github.com/Zoren-Software/VoleiClub/issues/new?assignees=&labels=bug&template=--bug--.md&title=%5B+BUG+%5D+Descri%C3%A7%C3%A3o+do+Bug" target="blank">Reports</va-button>
        </va-popover> 
      </va-navbar-item>
      <va-navbar-item>
        <va-button-dropdown
          hide-icon
        >
          <template #label>
            <va-badge overlap>
              <template #text>
                <va-icon size="12px" /> 99+
              </template>
              <va-icon name="notifications" />
            </va-badge>
          </template>
          <ListItemsNotification />
        </va-button-dropdown>
      </va-navbar-item>
      <va-navbar-item>
        <va-button-dropdown>
          <template #label>
            <va-icon name="account_circle" />
          </template>
          <ListItemsUser />
        </va-button-dropdown>
      </va-navbar-item>
      <va-navbar-item>
        <va-button icon="settings"/>
      </va-navbar-item>
    </template>
  </va-navbar>
</template>

<script>
import ListItemsUser from '~/components/menu/actions/user/ListItems'
import ListItemsNotification from '~/components/menu/actions/notification/ListItems'

export default{
  components: {
    ListItemsUser,
    ListItemsNotification
  },

  data () {
    return {
      minimized: false,
      titles: [
        { title: 'Home', link: '/', active: false },
        { title: 'Treinos', link: '/trainings', active: false },
        { title: 'Times', link: '/teams', active: false },
        { title: 'Jogadores', link: '/players', active: false },
        { title: 'Notificações', link: '/notifications', active: false },
        { title: 'Configurações', link: '/settings', active: false },
      ],
    }
  },

  methods: {
    toggleMinimize() {
      this.minimized = !this.minimized
      this.$emit('toggleMinimize', this.minimized)
    },
  },

  watch: {
    $route() {
      this.computedTitles;
    },
  },

  created() {
    this.computedTitles;
  },

  computed: {
    activeTitle() {
      return this.titles.find((title) => title.active).title;
    },
    computedTitles() {
      return this.titles.map((title) => {
        title.active = this.$route.path === title.link;
        return title
      });
    },
  },
}
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
      height:  4rem !important;
      padding: 0px 15px 0px 15px !important;
  }
}

</style>