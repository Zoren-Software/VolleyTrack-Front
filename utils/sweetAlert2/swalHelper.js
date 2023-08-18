import Swal from "sweetalert2";

function confirmAction(options, onConfirm, onCancel) {
  const confirmActionOptions = options.confirmAction;
  delete options.confirmAction;

  Swal.fire(options).then((result) => {
    if (result.isConfirmed) {
      if (confirmActionOptions) {
        Swal.fire(confirmActionOptions);
      }
      if (onConfirm) onConfirm();
    } else if (result.dismiss === Swal.DismissReason.cancel && onCancel) {
      onCancel();
    }
  });
}

export function confirmDeleteSingle(onDelete, onCancel) {
  confirmAction(
    {
      title: "Deseja deletar este registro?",
      text: "Você não será capaz de reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, deletar!",
      confirmButtonColor: "#154EC1",
      cancelButtonColor: "#E42222",
      cancelButtonText: "Não, cancelar!",
      confirmAction: {
        title: "Deletando!",
        text: "Seu registro está sendo deletado!",
        timer: 1000,
        icon: "info",
        showConfirmButton: false,
      },
    },
    onDelete,
    onCancel
  );
}

export function confirmDeleteMultiple(totalItems, onDelete, onCancel) {
  confirmAction(
    {
      title: "Deseja deletar estes registros?",
      text: "Você não será capaz de reverter isso!",
      icon: "warning",
      html: `Você tem <b>${totalItems}</b> registros selecionados para deletar.<br>`,
      showCancelButton: true,
      confirmButtonText: "Sim, deletar!",
      confirmButtonColor: "#154EC1",
      cancelButtonColor: "#E42222",
      cancelButtonText: "Não, cancelar!",
      confirmAction: {
        title: "Deletando!",
        text: "Seus registros estão sendo deletados!",
        timer: 1000,
        icon: "info",
        showConfirmButton: false,
      },
    },
    onDelete,
    onCancel
  );
}

export function confirmSuccess(title, onConfirm) {
  confirmAction(
    {
      icon: "success",
      title,
      showConfirmButton: true,
      confirmButtonColor: "#154EC1",
    },
    onConfirm
  );
}

export function confirmError(text, footer) {
  confirmAction({
    icon: "error",
    title: "Erro!",
    text: text,
    showConfirmButton: true,
    confirmButtonColor: "#154EC1",
    footer,
  });
}