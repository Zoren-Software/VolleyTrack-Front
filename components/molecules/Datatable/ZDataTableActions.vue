<template>
  <va-button
    preset="plain"
    icon="edit"
    @click="actEdit(this.id)"
  />
  <va-button
    preset="plain"
    icon="delete"
    color="danger"
    class="ml-3"
    @click="actionDelete(this.id)"
  />
</template>

<script>

import Swal from 'sweetalert2'

export default {
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  emits: ['edit', 'delete'],
  methods: {
    actEdit(id) {
      this.$emit('edit', id);
    },
    actionDelete(id) {
      Swal.fire({
        title: 'Deseja deletar este registro?',
        text: "Você não será capaz de reverter isso!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar!',
        confirmButtonColor: '#154EC1',
        cancelButtonColor: '#E42222',
        cancelButtonText: 'Não, cancelar!',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Deletando!',
            text: 'Seu registro esta sendo deletado!',
            timer: 1000,
            icon: 'info',
            showConfirmButton: false,
          })
          this.$emit('delete', id);
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
          ) {
            Swal.fire({
            title: 'Cancelado',
            text: 'Seu registro ainda continua existindo :)',
            icon: 'error',
            confirmButtonColor: '#154EC1',
          })
        }
      })
    }
  }
}
</script>