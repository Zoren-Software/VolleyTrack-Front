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
  if (!Array.isArray(footer)) {
    confirmAction({
      icon: "error",
      title: "Erro!",
      text,
      showConfirmButton: true,
      confirmButtonColor: "#154EC1",
      footer: `<ul style="text-align: center; color: red; list-style-position: inside; margin: 0; padding: 0;">${footer}</ul>`,
    });
  }

  const listItems = footer.map(item => {
    if (Array.isArray(item)) {
      const subListItems = item.map(subItem => `<li style="margin-bottom: 5px;">${subItem}</li>`).join(""); // Adiciona .join("") aqui
      const subListHtml = `<ul style="text-align: center; color: red; list-style-position: inside; margin: 0; padding: 0;">${subListItems}</ul>`;
      return subListHtml;
    } else {
      return `<li style="margin-bottom: 5px;">${item}</li>`;
    }
  }).join("");

  const footerHtml = `<ul style="text-align: center; color: red; list-style-position: inside; margin: 0; padding: 0;">${listItems}</ul>`;

  confirmAction({
    icon: "error",
    title: "Erro!",
    text,
    showConfirmButton: true,
    confirmButtonColor: "#154EC1",
    footer: footerHtml,
  });
}

export function confirmAskSendEmailNotification(onConfirm, onCancel) {
  confirmAction(
    {
      title: "Deseja enviar um e-mail de ativação para o usuário?",
      text: "O usuário receberá um link para ativar a conta.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim, enviar",
      confirmButtonColor: "#154EC1",
      cancelButtonText: "Não, apenas salvar",
      cancelButtonColor: "#E42222",
    },
    onConfirm,
    onCancel
  );
}