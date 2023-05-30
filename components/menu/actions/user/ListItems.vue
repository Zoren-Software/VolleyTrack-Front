<template>
  <va-list>
    <va-list-label>
      Ações
    </va-list-label>
    <va-list-item 
      v-for="action in actionsUser"
      :key="action.title"
      :class="`no-style-link hover` + (isSelected(action.action) ? ' selected' : '')"
      :preset="value ? 'primary' : 'secondary'"
      @click="this.action(action.action)"
    >
      <va-list-item-section class="mb-2 ml-3 mr-3 mt-2">
        {{ action.title }}
      </va-list-item-section>
    </va-list-item>
  </va-list>
</template>

<script>
export default{
  data () {
    return {
      actionsUser: [
        { title: 'Minha conta', action: 'account', active: false },
        { title: 'Logout', action: 'logout', active: false },
      ],
      value: true,
    }
  },

  methods: {
    action (type) {
      if (type === 'account') {
        this.$router.push('/account')
      } else if (type === 'logout') {
        this.logout()
      }
    },

    logout () {
      const { onLogout } = useApollo()
      onLogout()
      localStorage.removeItem('userToken')
      this.$router.push('/login')
    },

    isSelected (action) {
      if (this.$route.path === '/account') {
        return action === 'account'
      }
    },
  },
}
</script>

<style scoped>
.hover {
  transition: all 0.1s ease;
  border: 2px solid transparent;
  border-radius: 5px; /* raio de arredondamento */
}
.hover:hover {
  transition: all 0.1s ease;
  background-color: #deecfd;
  border: 2px solid transparent;
  border-color: #deecfd; /* cor da borda ao passar o mouse */
  border-radius: 5px; /* raio de arredondamento */
}

.selected {
  transition: all 0.1s ease;
  background-color: #deecfd;
  border: 2px solid transparent;
  border-color: #deecfd; /* cor da borda ao passar o mouse */
  border-radius: 5px; /* raio de arredondamento */
}


</style>