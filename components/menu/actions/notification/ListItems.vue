<template>
  <va-list id="notification-dropdown">
    <va-list-label>
      Notificações
    </va-list-label>
    <va-list-item 
      v-for="action in actionsUser"
      class="no-style-link hover"
      :v-key="action.title"
      :to="action.link"
      :preset="value ? 'primary' : 'secondary'"
    >
      <va-list-item-section>
        <va-list-item-label>
          {{ action.title }}
        </va-list-item-label>
        <va-list-item-label 
          caption 
          class="notification-item-list"
        >
          {{ action.description }}
        </va-list-item-label>
      </va-list-item-section>
      <va-list-item-section icon>
        <va-icon
          name="remove_red_eye"
          color="background-tertiary"
        />
      </va-list-item-section>
    </va-list-item>
  </va-list>
  <div class="mt-3 mb-3">
    <va-divider />
  </div>
  <va-button to="/notifications" size="small" class="mr-6 mb-2 mr-5">Ver todas as notificações</va-button>
  <va-button size="small" class="mr-6 mb-2">Limpar</va-button>
</template>

<script>
export default{
  data () {
    return {
      actionsUser: [
        { title: 'Treino', description:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', link: '/training' },
        { title: 'Treino', description:'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', link: '/training' },
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

.notification-item-list{
  /* limitar número de caracteres */
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  max-width: 11rem;
}

</style>
