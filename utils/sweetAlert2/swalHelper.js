import Swal from "sweetalert2";

export function confirmDeleteSingle(onDelete, onCancel) {
  Swal.fire({
    title: "Deseja deletar este registro?",
    text: "Você não será capaz de reverter isso!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, deletar!",
    confirmButtonColor: "#154EC1",
    cancelButtonColor: "#E42222",
    cancelButtonText: "Não, cancelar!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deletando!",
        text: "Seu registro está sendo deletado!",
        timer: 1000,
        icon: "info",
        showConfirmButton: false,
      });
      onDelete();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Cancelado",
        text: "Seu registro ainda continua existindo :)",
        icon: "error",
        confirmButtonColor: "#154EC1",
      });
      onCancel();
    }
  });
}

export function confirmDeleteMultiple(totalItems, onDelete, onCancel) {
  Swal.fire({
    title: "Deseja deletar estes registros?",
    text: "Você não será capaz de reverter isso!",
    icon: "warning",
    html: `Você tem <b>${totalItems}</b> registros selecionados para deletar.<br>`,
    showCancelButton: true,
    confirmButtonText: "Sim, deletar!",
    confirmButtonColor: "#154EC1",
    cancelButtonColor: "#E42222",
    cancelButtonText: "Não, cancelar!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deletando!",
        text: "Seus registros estão sendo deletados!",
        timer: 1000,
        icon: "info",
        showConfirmButton: false,
      });
      onDelete();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Cancelado",
        text: "Seus registros ainda continuam existindo :)",
        icon: "error",
        confirmButtonColor: "#154EC1",
      });
      onCancel();
    }
  });
}