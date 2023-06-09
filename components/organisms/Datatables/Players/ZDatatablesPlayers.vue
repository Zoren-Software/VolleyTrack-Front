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
  </ZDatatableGeneric>
</template>

<script>

import { defineComponent } from "vue";
import ZDatatableGeneric from '~/components/molecules/Datatable/ZDatatableGeneric'
import ZUser from '~/components/molecules/Datatable/Slots/ZUser'
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZUser,
    ZPosition
},

  mounted() {
    this.loadData()
  },

  data() {
    const search = ''
    let loading = false
    const items = [
      {
          id: "1",
          name: "Administrador",
          email: "admin@voleiclub.com",
          positions: [
            {
              id: 1,
              name: "Central"
            },
            {
              id: 2,
              name: "Levantador"
            }
          ],
          emailVerifiedAt: null,
          createdAt: "2023-05-22 02:20:56",
          updatedAt: "2023-05-25 00:00:14"
        },
        {
          id: "2",
          name: "Suporte",
          email: "suporte@voleiclub.com",
          positions: [
            {
              id: 2,
              name: "Levantador"
            }
          ],
          emailVerifiedAt: null,
          createdAt: "2023-05-22 02:20:56",
          updatedAt: "2023-05-25 00:00:14"
        },
        {
          id: "3",
          name: "Usuário Teste Técnico",
          email: "test.technician@voleiclub.com",
          positions: [
            {
              id: 3,
              name: "Libero"
            }
          ],
          emailVerifiedAt: null,
          createdAt: "2023-05-22 02:20:57",
          updatedAt: "2023-05-25 00:00:14"
        },
        {
          id: "4",
          name: "Usuário Teste Jogador",
          email: "test.player@voleiclub.com",
          positions: [
            {
              id: 4,
              name: "Oposto"
            }
          ],
          emailVerifiedAt: null,
          createdAt: "2023-05-22 02:20:57",
          updatedAt: "2023-05-25 00:00:14"
        },
        {
          id: "5",
          name: "Usuário Sem Permissao",
          email: "no.permission@voleiclub.com",
          positions: [
            {
              id: 5,
              name: "Ponteiro"
            }
          ],
          emailVerifiedAt: null,
          createdAt: "2023-05-22 02:20:57",
          updatedAt: "2023-05-25 00:00:14"
        },
        {
          id: "6",
          name: "Srta. Nicole Mel Correia Neto",
          email: "patricia90@example.net",
          positions: [],
          emailVerifiedAt: "2023-05-22 02:21:17",
          createdAt: "2023-05-22 02:21:17",
          updatedAt: "2023-05-22 02:21:17"
        },
        {
          id: "7",
          name: "Sr. Breno Serna Valência",
          email: "xrico@example.org",
          positions: [],
          emailVerifiedAt: "2023-05-22 02:21:17",
          createdAt: "2023-05-22 02:21:17",
          updatedAt: "2023-05-22 02:21:17"
        },
        {
          id: "8",
          name: "Breno Gian Zaragoça Jr.",
          email: "patricia31@example.org",
          positions: [],
          emailVerifiedAt: "2023-05-22 02:21:17",
          createdAt: "2023-05-22 02:21:17",
          updatedAt: "2023-05-22 02:21:17"
        },
        {
          id: "9",
          name: "Dr. Danilo Ortiz Sobrinho",
          email: "neves.jonas@example.net",
          positions: [],
          emailVerifiedAt: "2023-05-22 02:21:17",
          createdAt: "2023-05-22 02:21:17",
          updatedAt: "2023-05-22 02:21:17"
        },
        {
          id: "10",
          name: "Sr. Mário Davi Saito Neto",
          email: "icolaco@example.net",
          positions: [],
          emailVerifiedAt: "2023-05-22 02:21:17",
          createdAt: "2023-05-22 02:21:17",
          updatedAt: "2023-05-22 02:21:17"
        }
    ];

    const columns = [
      { key: "id", name:"id", sortable: true },
      { key: "user", name:"user", label:"Jogadores", sortable: true },
      { key: "positions", name:"positions", label:"Posições", sortable: true },
      { key: "cpf", name:"cpf", label: "CPF", sortable: true },
      { key: "team", name:"team", label:"Times", sortable: true },
    ];

    return {
      search,
      items,
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
    loadData() {
      this.loading = true
      // criar timeout para simular carregamento de dados
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
  },
});
</script>