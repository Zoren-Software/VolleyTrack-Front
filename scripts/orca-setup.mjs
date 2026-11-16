#!/usr/bin/env node
/**
 * Prepara um worktree do Orca: reserva slot, grava portas no .env.local, copia .env
 * do primário e instala deps (hook setup do orca.yaml). Espelho enxuto do FRONT SRP.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'

const PROJECT_NAME = 'VoleiClub Front'
const MAX_SLOT = 9
const SLOT_STEP = 10
const DEFAULT_PORT = 3000
const PORT_ENV_KEY = 'PORT'
const SLOT_ENV_FILE = '.env.local'
const SLOT_ENV_HEADER = '# Portas deste worktree do Orca (`pnpm orca:setup`).\n'
const REGISTRY_FILE = 'orca-slots.json'
const LOCK_TIMEOUT_MS = 15_000
const LOCK_RETRY_MS = 100
const INSTALL_COMMAND = 'pnpm install --frozen-lockfile --prefer-offline'
const COPIED_FILES = ['.env']
const BACKEND_REGISTRY = join(homedir(), 'Projects', 'VoleiClub', '.git', 'orca-slots.tsv')
const BACKEND_URL_KEY = 'API_ENDPOINT'
const SHARED_BACKEND_URL = 'http://graphql.volleytrack.local'
const BACKEND_URL_SUFFIX = ''
const ORCA_SLOT_KEY = 'ORCA_SLOT'
const ORCA_BACKEND_KEY = 'ORCA_BACKEND'

function print(msg) { process.stdout.write(`${msg}\n`) }
function fail(msg) { process.stderr.write(`Erro: ${msg}\n`); process.exit(1) }
function git(...args) { return execFileSync('git', args, { encoding: 'utf8' }).trim() }
function sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms) }

function pathKey(path) {
  return process.platform === 'win32' || process.platform === 'darwin' ? path.replaceAll('\\', '/').toLowerCase() : path.replaceAll('\\', '/')
}

function withLock(lockDir, action) {
  const deadline = Date.now() + LOCK_TIMEOUT_MS
  for (;;) {
    try { mkdirSync(lockDir); break }
    catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) throw error
      if (Date.now() > deadline) { rmSync(lockDir, { recursive: true, force: true }); continue }
      sleep(LOCK_RETRY_MS)
    }
  }
  try { return action() } finally { rmSync(lockDir, { recursive: true, force: true }) }
}

function parseRegistry(content) {
  try {
    const parsed = JSON.parse(content)
    return Object.fromEntries(Object.entries(parsed ?? {}).filter(([, e]) => Number.isInteger(e?.slot) && typeof e?.path === 'string'))
  } catch { return {} }
}

function reserveSlot(gitCommonDir, worktree) {
  const registryPath = join(gitCommonDir, REGISTRY_FILE)
  return withLock(`${registryPath}.lock`, () => {
    const registry = existsSync(registryPath) ? parseRegistry(readFileSync(registryPath, 'utf8')) : {}
    const alive = Object.fromEntries(Object.entries(registry).filter(([, e]) => existsSync(e.path)))
    const key = pathKey(worktree)
    let slot = alive[key]?.slot
    if (!slot) {
      const used = new Set(Object.values(alive).map(e => e.slot))
      slot = Array.from({ length: MAX_SLOT }, (_, i) => i + 1).find(n => !used.has(n))
      if (!slot) fail(`todos os ${MAX_SLOT} slots estão ocupados. Arquive um worktree parado e rode de novo.`)
      alive[key] = { slot, path: worktree }
    } else {
      alive[key] = { slot, path: worktree }
    }
    writeFileSync(registryPath, `${JSON.stringify(alive, null, 2)}\n`)
    return slot
  })
}

function setEnvValues(text, values) {
  return Object.entries(values).reduce((current, [name, value]) => {
    const line = new RegExp(`^${name}=.*$`, 'm')
    if (line.test(current)) return current.replace(line, `${name}=${value}`)
    const base = current.trimEnd()
    return base ? `${base}\n${name}=${value}\n` : `${name}=${value}\n`
  }, text)
}

function portOf(slot) { return DEFAULT_PORT + slot * SLOT_STEP }

function writeSlotEnv(worktree, slot, backendUrl, backendMode) {
  const file = join(worktree, SLOT_ENV_FILE)
  const current = existsSync(file) ? readFileSync(file, 'utf8') : SLOT_ENV_HEADER
  const values = {
    [ORCA_SLOT_KEY]: String(slot),
    [PORT_ENV_KEY]: String(portOf(slot)),
    [ORCA_BACKEND_KEY]: backendMode,
  }
  if (BACKEND_URL_KEY) values[BACKEND_URL_KEY] = backendUrl
  writeFileSync(file, setEnvValues(current, values))
}

function copyFromPrimary(primary, worktree) {
  for (const file of COPIED_FILES) {
    const source = join(primary, file)
    const target = join(worktree, file)
    if (existsSync(target) || !existsSync(source)) continue
    mkdirSync(dirname(target), { recursive: true })
    copyFileSync(source, target)
    print(`  copiado do primário: ${file}`)
  }
}

function parseBackendRegistry(content) {
  return content.split('\n').flatMap((line) => {
    const [slot, port, path = ''] = line.split('\t')
    const entry = { slot: Number(slot), port: Number(port), path }
    return entry.slot > 0 && entry.port > 0 && path ? [entry] : []
  })
}

function discoverIssueKey(worktree) {
  try {
    const branch = git('-C', worktree, 'branch', '--show-current')
    const m = /\b([A-Z][A-Z0-9]+-\d+)\b/.exec(branch)
    return m?.[1]
  } catch { return undefined }
}

function pairBackend(worktree, requested) {
  if (!BACKEND_REGISTRY) {
    return { url: SHARED_BACKEND_URL, mode: 'none' }
  }
  const mode = requested || 'auto'
  let entries = []
  if (existsSync(BACKEND_REGISTRY)) {
    entries = parseBackendRegistry(readFileSync(BACKEND_REGISTRY, 'utf8')).filter(e => existsSync(e.path))
  }
  let backend
  if (mode === 'none') backend = undefined
  else if (/^[1-9]\d*$/.test(mode)) backend = entries.find(e => e.slot === Number(mode))
  else {
    const issue = discoverIssueKey(worktree)
    backend = issue ? entries.find(e => discoverIssueKey(e.path) === issue) : undefined
  }
  const url = backend
    ? `http://127.0.0.1:${backend.port}${BACKEND_URL_SUFFIX}`
    : SHARED_BACKEND_URL
  if (backend) print(`  back: slot ${backend.slot} (${url})`)
  else print(`  back: compartilhado (${url})`)
  return { url, mode: backend ? String(backend.slot) : mode === 'none' ? 'none' : 'auto' }
}

function run(command, cwd) {
  const result = spawnSync(command, { cwd, stdio: 'inherit', shell: true })
  if (result.status !== 0) fail(`${command} falhou (código ${result.status ?? '?'})`)
}

function main() {
  const { values } = parseArgs({
    options: {
      'skip-install': { type: 'boolean' },
      backend: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  })
  if (values.help) {
    print(`Uso: pnpm orca:setup [--skip-install] [--backend auto|none|<slot>]`)
    return
  }

  const worktree = resolve(git('rev-parse', '--show-toplevel'))
  const gitCommonDir = resolve(git('rev-parse', '--path-format=absolute', '--git-common-dir'))
  const primary = dirname(gitCommonDir)

  if (pathKey(worktree) === pathKey(primary)) {
    print(`${PROJECT_NAME} no Orca: slot 0 (checkout primário)`)
    print(`  porta padrão: ${DEFAULT_PORT}`)
    print('Nada a fazer: o checkout primário mantém as portas de sempre.')
    return
  }

  const slot = reserveSlot(gitCommonDir, worktree)
  print(`${PROJECT_NAME} no Orca: slot ${slot}`)
  print(`  worktree: ${worktree}`)
  print(`  porta: ${portOf(slot)} (${PORT_ENV_KEY} no ${SLOT_ENV_FILE})`)
  copyFromPrimary(primary, worktree)
  const { url, mode } = pairBackend(worktree, values.backend)
  writeSlotEnv(worktree, slot, url, mode)
  print(`  portas do slot gravadas no ${SLOT_ENV_FILE}`)

  if (!values['skip-install']) {
    print('\nInstalando as dependências...')
    run(INSTALL_COMMAND, worktree)
  }

  print(`\nPronto. Neste worktree: pnpm dev → http://127.0.0.1:${portOf(slot)}`)
}

try { main() } catch (error) { fail(error instanceof Error ? error.message : String(error)) }
