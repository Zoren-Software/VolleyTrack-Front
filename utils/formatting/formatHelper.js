export function formatCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  cpf = cpf.padStart(11, "0");
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, "");
  cnpj = cnpj.padStart(14, "0");
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatRG(rg) {
  rg = rg.replace(/\D/g, "");
  rg = rg.padStart(9, "0");
  return rg.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
}

export function formatPhoneOnType(phone) {
  if (phone.length === 0) {
    return "";
  } else if (phone.length <= 2) {
    return phone.replace(/^(\d{0,2})/, "($1");
  } else if (phone.length <= 6) {
    return phone.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
  } else if (phone.length <= 10) {
    return phone.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    return phone.replace(
      /^(\d{2})(\d{1})(\d{4})(\d{0,4})/,
      "($1) $2 $3-$4"
    );
  }
}