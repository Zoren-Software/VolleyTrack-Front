<template>
  <va-navbar-item>
    <va-button-dropdown
      color="background-primary"
    >
      <template #label>
        <va-avatar v-if="user.id" size="small" class="mr-6">{{ firstLatter }}</va-avatar>
        <va-icon v-else name="account_circle" />
      </template>
      <ListItemsUser />
    </va-button-dropdown>
  </va-navbar-item>
</template>

<script>
  import ZButtonDropdown from '~/components/atoms/Buttons/ZButtonDropdown';
  import ZAvatar from '~/components/atoms/Avatar/ZAvatar';
  import ZIcon from '~/components/atoms/Icons/ZIcon'
  import ListItemsUser from '~/components/menu/actions/user/ListItems'

  export default {
    name: "ZNavbarItemUser",
    components: {
      ListItemsUser,
      ZButtonDropdown,
      ZAvatar,
      ZIcon
    },
    data () {
      return {
        user: {
          id: null,
          name: 'Usuário',
        }
      }
    },
    computed: {
      firstLatter() {
        return this.user.name.charAt(0).toUpperCase()
      }
    },
    created() {
      this.getUser()
    },

    mounted() {
      this.getUser()
    },

    methods: {
      toggleMinimize() {
        this.minimized = !this.minimized
        this.$emit('toggleMinimize', this.minimized)
      },

      async getUser() {
        if (localStorage.getItem('user')) {
          this.user = await JSON.parse(localStorage.getItem('user'))
        } else {
          const query = gql`
            ${ME}
          `
          const { data:{value} } = await useAsyncQuery(query, {})
    
          if (value?.me) {
            this.user = value.me
            localStorage.setItem('user', JSON.stringify(this.user));
          }
        }
      }
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
    height:  4rem !important;
    padding: 0px 15px 0px 15px !important;
  }
}

</style>