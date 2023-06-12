<template>
  <ZDatatableGeneric 
    selectable
    :includeActionsColumn="true"
    :items="items" 
    :columns="columns"
    :loading="loading"
    v-model="search"
    @add="addPlayer"
    @edit="editPlayer"
    @delete="deletePlayer"
    @deletes="deletePlayers"
  >
    <template #cell(user)="{rowKey}">
      <ZUser :data="rowKey" />
    </template>
    <template #cell(positions)="{rowKey:{positions}}">
      <ZPosition :data="positions" />
    </template>
    <template #cell(cpf)="{rowKey:{cpf}}">
      <ZCPF :data="cpf" />
    </template>
  </ZDatatableGeneric>
</template>

<script>

import { defineComponent } from "vue";
import PLAYERS from '~/graphql/user/query/users.graphql'
import ZDatatableGeneric from '~/components/molecules/Datatable/ZDatatableGeneric'
import ZUser from '~/components/molecules/Datatable/Slots/ZUser'
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";
import ZCPF from "~/components/molecules/Datatable/Slots/ZCPF";

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZUser,
    ZPosition,
    ZCPF
},

  created() {
    this.getPlayers()
  },

  data() {
    const search = ''
    let loading = false

    const columns = [
      { key: "id", name:"id", sortable: true },
      { key: "user", name:"user", label:"Jogadores", sortable: true },
      { key: "positions", name:"positions", label:"Posições", sortable: true },
      { key: "cpf", name:"cpf", label: "CPF", sortable: true },
      { key: "team", name:"team", label:"Times", sortable: true },
    ];

    return {
      search,
      items : [],
      loading,
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
    editPlayer(id) {
      // Implemente a lógica de adicionar jogador.
      console.log('action edit', id)
    },
    deletePlayer(id) {
      // Implemente a lógica de deletar jogadores.
      console.log('action delete', id)
    },
    deletePlayers(items) {
      // Implemente a lógica de deletar jogadores.
      console.log('action deletes', items)
    },

    async getPlayers() {
      this.loading = true

      const query = gql`
          ${PLAYERS}
      `;

      let { onResult } = await useQuery(query, {});

      console.log('onResult 1')
      
      onResult((result) => {
        if(result?.data?.users?.data.length > 0) {
          this.items = result.data.users.data;
        }
        console.log('onResult 2')
      })
      console.log('onResult 3')

      this.loading = false
    },
  },
});
</script>