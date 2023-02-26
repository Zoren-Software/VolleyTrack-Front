<template>
  <va-list>
    <va-list-label>
      Ações
    </va-list-label>
    <va-list-item 
      v-for="action in actionsUser"
      class="no-style-link hover"
      :v-key="action.title"
      :to="action.link"
      :preset="value ? 'primary' : 'secondary'"
    >
      <va-list-item-section class="mb-2 ml-3 mr-3 mt-2">
        {{action.title}}
      </va-list-item-section>
    </va-list-item>
  </va-list>
</template>

<script>
export default{
  data () {
    return {
      actionsUser: [
        { title: 'Minha conta', link: '/account' },
        { title: 'Logout', link: '/logout' },
      ],
    }
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

</style>