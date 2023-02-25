<template>
  <va-list>
    <va-list-label>
      Ações
    </va-list-label>
    <va-list-item 
      v-for="action in actionsUser"
      class="no-style-link"
      :v-key="action.title"
      :to="action.link"
    >
      <va-list-item-section class="mb-3 ml-3">
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