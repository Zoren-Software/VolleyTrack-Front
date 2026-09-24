#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_TITLE="VoleiClub Front Setup"

cd "$PROJECT_ROOT"

say() { printf '%b\n' "$*"; }
die() {
  local msg="$1"
  if use_whiptail; then
    whiptail --clear --title "$APP_TITLE" --msgbox "$(printf '%b' "❌ $msg")" 12 72
  fi
  say "❌ $msg"
  exit 1
}

has_cmd() { command -v "$1" >/dev/null 2>&1; }

use_whiptail() {
  [[ "${VT_START_PLAIN:-}" == "1" ]] && return 1
  [[ -t 0 && -t 1 ]] || return 1
  has_cmd whiptail
}

ui_msg() {
  local text="$1"
  local h="${2:-12}"
  local w="${3:-72}"
  if use_whiptail; then
    whiptail --clear --title "$APP_TITLE" --msgbox "$(printf '%b' "$text")" "$h" "$w"
  else
    say "$text"
  fi
}

ui_yesno() {
  local text="$1"
  if use_whiptail; then
    whiptail --clear --title "$APP_TITLE" --yesno "$(printf '%b' "$text")" 14 72
  else
    read -r -p "$(printf '%b' "$text") [s/N]: " answer
    [[ "${answer,,}" =~ ^(s|sim|y|yes)$ ]]
  fi
}

run_step() {
  local description="$1"
  shift
  if use_whiptail; then
    whiptail --clear --title "$APP_TITLE" --infobox "$(printf '%b' "Executando:\n\n$description")" 9 72
    sleep 0.5
  fi
  "$@"
  say "✅ $description"
}

trim_v_prefix() {
  local v="${1:-}"
  echo "${v#v}"
}

semver_ge() {
  # Usage: semver_ge <a> <b>  => true if a >= b
  # Ex: semver_ge "20.11.1" "20.11.1" => true
  #     semver_ge "20.12.0" "20.11.1" => true
  #     semver_ge "18.20.0" "20.11.1" => false
  local a b
  a="$(trim_v_prefix "${1:-0.0.0}")"
  b="$(trim_v_prefix "${2:-0.0.0}")"

  local a1 a2 a3 b1 b2 b3
  IFS='.' read -r a1 a2 a3 <<<"$a"
  IFS='.' read -r b1 b2 b3 <<<"$b"
  a1="${a1:-0}"; a2="${a2:-0}"; a3="${a3:-0}"
  b1="${b1:-0}"; b2="${b2:-0}"; b3="${b3:-0}"

  if (( a1 != b1 )); then (( a1 > b1 )); return; fi
  if (( a2 != b2 )); then (( a2 > b2 )); return; fi
  (( a3 >= b3 ))
}

check_node() {
  has_cmd node || die "Node.js não encontrado. Instale o Node (recomendado v20.11.1+)."

  local node_v
  node_v="$(node -v 2>/dev/null || true)"
  node_v="$(trim_v_prefix "$node_v")"
  [[ -n "$node_v" ]] || die "Não consegui detectar a versão do Node."

  # README do projeto recomenda v20.11.1 ou superior
  local recommended="20.11.1"
  if semver_ge "$node_v" "$recommended"; then
    say "✅ Node.js OK (v$node_v)"
    return 0
  fi

  # Ainda assim, aceita Node 20+ mas avisa se estiver abaixo do recomendado
  if semver_ge "$node_v" "20.0.0"; then
    say "⚠️  Node.js v$node_v (recomendado v$recommended+)"
    return 0
  fi

  die "Node.js v$node_v é muito antigo. Atualize para v$recommended+ (ou pelo menos v20)."
}

check_pnpm() {
  if ! has_cmd pnpm; then
    if has_cmd corepack; then
      die "pnpm não encontrado. Rode: corepack enable && corepack prepare pnpm@latest --activate"
    fi
    die "pnpm não encontrado. Instale o pnpm (ou use corepack)."
  fi

  say "✅ pnpm OK ($(pnpm -v))"
}

check_lockfiles() {
  if [[ -f "package-lock.json" ]]; then
    die "Encontrado package-lock.json. Este projeto usa pnpm. Remova o arquivo e tente novamente."
  fi
  if [[ -f "yarn.lock" ]]; then
    die "Encontrado yarn.lock. Este projeto usa pnpm. Remova o arquivo e tente novamente."
  fi
  if [[ ! -f "pnpm-lock.yaml" ]]; then
    say "⚠️  pnpm-lock.yaml não encontrado (será gerado no install)."
  fi
}

ensure_env() {
  [[ -f ".env.example" ]] || die "Arquivo .env.example não encontrado na raiz do projeto."

  if [[ -f ".env" ]]; then
    say "ℹ️  .env já existe (mantendo como está)."
    return 0
  fi

  cp .env.example .env
  say "✅ Criado .env a partir de .env.example"
}

update_browserslist_db() {
  run_step "Atualizando base do Browserslist (caniuse-lite)" pnpm run browserslist:update
}

main() {
  ui_msg "Bem-vindo ao inicializador do Front.\n\nEste script vai:\n\n- Validar Node.js\n- Validar pnpm\n- Validar lockfiles\n- Garantir .env\n- Rodar pnpm install\n- (Opcional) Atualizar Browserslist DB\n- Rodar pnpm dev\n\nProjeto:\n$PROJECT_ROOT" 22 74

  if ! ui_yesno "Deseja iniciar agora?"; then
    ui_msg "Operação cancelada.\n\nQuando quiser, rode:\n./scripts/start.sh"
    exit 0
  fi

  run_step "Validando versão do Node.js" check_node
  run_step "Validando instalação do pnpm" check_pnpm
  run_step "Checando lockfiles do gerenciador de pacotes" check_lockfiles
  run_step "Preparando arquivo .env" ensure_env

  ui_msg "Agora vou instalar dependências.\n\nIsso pode levar alguns minutos." 10 72
  run_step "Instalando dependências (pnpm install)" pnpm install

  if ui_yesno "Deseja atualizar agora a base do Browserslist para evitar warnings de caniuse-lite desatualizado?"; then
    update_browserslist_db
  else
    say "ℹ️  Atualização do Browserslist ignorada."
  fi

  ui_msg "Tudo pronto.\n\nVou iniciar o servidor de desenvolvimento com pnpm dev.\n(Pressione Ctrl+C para encerrar)." 12 72
  say "▶️  Subindo o dev server (pnpm dev)..."
  pnpm dev
}

main "$@"

