<template>
  <ZButton color="primary" class="mr-3" @click="add">Adicionar</ZButton>
  <ZButton color="danger" :disabled="!(selectedItemsEmitted.length > 1)" @click="actionDelete">Deletar</ZButton>
</template>

<script>

import ZButton from '~/components/atoms/Buttons/ZButton'
import Swal from 'sweetalert2'

export default {
  components: {
    ZButton
  },
  emits: ['add', 'delete'],
  props: {
    selectedItemsEmitted: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    add() {
      this.$emit('add')
    },
    actionDelete() {
      const itemsDelete = this.selectedItemsEmitted.map((item) =>
         item.id
      )
      const totalItems = this.selectedItemsEmitted.length

      Swal.fire({
        title: 'Deseja deletar estes registros?',
        text: "Você não será capaz de reverter isso!",
        icon: 'warning',
        html:
          'Você tem <b>' + totalItems + '</b> registros selecionados para deletar.<br>',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar!',
        confirmButtonColor: '#154EC1',
        cancelButtonColor: '#E42222',
        cancelButtonText: 'Não, cancelar!',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Deletando!',
            text: 'Seus registros estão sendo deletados!',
            timer: 1000,
            icon: 'info',
            showConfirmButton: false,
          })
          this.$emit('delete', itemsDelete);
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          Swal.fire({
            title: 'Cancelado',
            text: 'Seus registros ainda continuam existindo :)',
            icon: 'error',
            confirmButtonColor: '#154EC1',
          })
        }
      })
    }
  }
}
</script>
