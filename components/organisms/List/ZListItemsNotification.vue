<template>
  <va-list id="notification-dropdown">
    <va-list-label>
      Notificações
    </va-list-label>
    <ZListItemNotification
      v-for="action in actionsUser"
      :key="action.title"
      :action="action"
    />
  </va-list>
  <div class="mt-3 mb-3">
    <va-divider />
  </div>
  <va-button
    to="/notifications"
    size="small"
    class="mr-6 mb-2 mr-5"
  >
    Ver todas as notificações
  </va-button>
  <va-button
    size="small"
    class="mr-6 mb-2"
  >
    Limpar
  </va-button>
</template>

<script>

import ZListItemNotification from '~/components/molecules/List/ZListItemNotification'

export default{
  components: {
    ZListItemNotification,
  },
  data () {
    return {
      actionsUser: [
        { title: 'Treino', description:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', link: '/trainings' },
        { title: 'Treino', description:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', link: '/trainings' },
        { title: 'Treino', description:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', link: '/trainings' },
      ]
    }
  },
}
</script>

<style scoped>
  /* seus estilos aqui */
</style>