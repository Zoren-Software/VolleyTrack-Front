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
      title: "Excluir registros selecionados?",
      text: "Você não poderá desfazer esta ação.",
      icon: "warning",
      html: `Você selecionou <b>${totalItems}</b> registro(s). Deseja excluí-los permanentemente?`,
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

export function confirmReadMultiple(totalItems, onConfirm, onCancel) {
  confirmAction(
    {
      title: "Marcar como lidas?",
      icon: "question",
      html: `Você vai marcar <b>${totalItems}</b> notificação(ões) não lida(s) como lidas.`,
      showCancelButton: true,
      confirmButtonText: "Sim, marcar como lidas",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      cancelButtonText: "Cancelar",
    },
    onConfirm,
    onCancel
  );
}

export function notifyInfo(title, text) {
  Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#16a34a",
  });
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
  let footerHtml = '';

  if (footer) {
    if (Array.isArray(footer)) {
      const listItems = footer.map(item => {
        if (Array.isArray(item)) {
          const subListItems = item.map(subItem => `<li style="margin-bottom: 5px;">${subItem}</li>`).join("");
          const subListHtml = `<ul style="text-align: center; color: red; list-style-position: inside; margin: 0; padding: 0;">${subListItems}</ul>`;
          return subListHtml;
        } else {
          return `<li style="margin-bottom: 5px;">${item}</li>`;
        }
      }).join("");
      footerHtml = `<ul style="text-align: center; color: red; list-style-position: inside; margin: 0; padding: 0;">${listItems}</ul>`;
    } else {
      // Se footer não é um array, trata como string
      footerHtml = `<ul style="text-align: center; color: red; list-style-position: inside; margin: 0; padding: 0;"><li style="margin-bottom: 5px;">${footer}</li></ul>`;
    }
  }

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
      title: "E-mail de ativação",
      html: `
        <div style="text-align: left; padding: 4px 0 2px;">
          <p style="margin: 0 0 14px; font-size: 16px; color: #111827; line-height: 1.5;">
            <strong>Deseja enviar um e-mail de ativação para o usuário?</strong>
          </p>
          <div style="background-color: #fff4ef; padding: 14px 16px; border-radius: 10px; border: 1px solid rgba(255, 78, 27, 0.2); border-left: 4px solid #FF4E1B;">
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.55;">
              O usuário receberá um link para <strong>ativar a conta</strong> e poderá definir a senha no primeiro acesso.
            </p>
          </div>
        </div>
      `,
      icon: "question",
      iconColor: "#FF4E1B",
      showCancelButton: true,
      confirmButtonText: "Sim, enviar e-mail",
      confirmButtonColor: "#FF4E1B",
      cancelButtonText: "Não, apenas salvar",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      width: "480px",
      padding: "1.5rem",
    },
    onConfirm,
    onCancel
  );
}

export function showSuccessToast(title, text) {
  Swal.fire({
    icon: "success",
    title,
    text,
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: "#fff",
    color: "#333",
    customClass: {
      popup: "swal2-toast",
    },
  });
}