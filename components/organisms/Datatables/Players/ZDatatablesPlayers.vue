<template>
  <ZDatatableGeneric 
    :items="items" 
    :columns="columns"
    :includeActionsColumn="true"
    @add="addPlayer" 
    @delete="deletePlayer"
    @deletes="deletePlayers"
    v-model="search"
    selectable
  />
</template>

<script>

import { defineComponent } from "vue";
import ZDatatableGeneric from '~/components/molecules/Datatable/ZDatatableGeneric'

export default defineComponent({
  components: {
      ZDatatableGeneric,
  },

  data() {
    const search = ''
      
    const items = [
      {
        id: 1,
        name: "Leanne Graham",
        username: "Bret",
        email: "Sincere@april.biz",
        phone: "1-770-736-8031 x56442",
      },
      {
        id: 2,
        name: "Ervin Howell",
        username: "Antonette",
        email: "Shanna@melissa.tv",
        phone: "010-692-6593 x09125",
      },
      {
        id: 3,
        name: "Clementine Bauch",
        username: "Samantha",
        email: "Nathan@yesenia.net",
        phone: "1-463-123-4447",
      },
      {
        id: 4,
        name: "Patricia Lebsack",
        username: "Karianne",
        email: "Julianne.OConner@kory.org",
        phone: "493-170-9623 x156",
      },
      {
        id: 5,
        name: "Chelsey Dietrich",
        username: "Kamren",
        email: "Lucio_Hettinger@annie.ca",
        phone: "(254)954-1289",
      },
    ];

    const columns = [
      { key: "id", sortable: true },
      { key: "username", sortable: true },
      { key: "name", sortable: true },
      { key: "email", sortable: true },
      { key: "phone", sortable: true },
    ];

    return {
      search,
      items,
      columns,
      selectedItems: [],
      selectedItemsEmitted: [],
      selectMode: "multiple",
      selectedColor: "primary",
      selectModeOptions: ["single", "multiple"],
      selectColorOptions: ["primary", "danger", "warning", "#EF467F"],
    };
  },

  methods: {
    unselectItem(item) {
      this.selectedItems = this.selectedItems.filter(
        (selectedItem) => selectedItem !== item
      );
    },
    addPlayer() {
      // Implemente a lógica de adicionar jogador.
      console.log('action add')
    },
    deletePlayer(id) {
      // Implemente a lógica de deletar jogadores.
      console.log('action delete', id)
    },
    deletePlayers(items) {
      // Implemente a lógica de deletar jogadores.
      console.log('action deletes', items)
    }
  },
});
</script>