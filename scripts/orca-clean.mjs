#!/usr/bin/env node
/**
 * Libera o slot do worktree atual (hook archive do orca.yaml / `pnpm orca:clean`).
 * Com `report` (padrão sem args no uso interativo: status), só lista.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'

const PROJECT_NAME = 'VoleiClub Front'
const REGISTRY_FILE = 'orca-slots.json'
const SLOT_ENV_FILE = '.env.local'
const ORCA_KEYS = ['ORCA_SLOT', 'ORCA_BACKEND', 'PORT']
const LOCK_TIMEOUT_MS = 15_000
const LOCK_RETRY_MS = 100

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

function clearEnvKeys(text, keys) {
  return keys.reduce((current, name) => current.replace(new RegExp(`^${name}=.*$\\n?`, 'm'), ''), text)
}

function status(gitCommonDir, primary) {
  const registryPath = join(gitCommonDir, REGISTRY_FILE)
  const registry = existsSync(registryPath) ? parseRegistry(readFileSync(registryPath, 'utf8')) : {}
  print(`Slot 0: ${PROJECT_NAME} · ${primary}`)
  for (const entry of Object.values(registry).sort((a, b) => a.slot - b.slot)) {
    const state = existsSync(entry.path) ? 'ativo' : 'pasta sumiu'
    print(`Slot ${entry.slot}: ${state} · ${entry.path}`)
  }
}

function release(gitCommonDir, worktree) {
  const registryPath = join(gitCommonDir, REGISTRY_FILE)
  const slot = withLock(`${registryPath}.lock`, () => {
    const registry = existsSync(registryPath) ? parseRegistry(readFileSync(registryPath, 'utf8')) : {}
    const key = pathKey(worktree)
    const current = registry[key]
    const next = Object.fromEntries(Object.entries(registry).filter(([k]) => k !== key))
    // Also drop dead paths
    const alive = Object.fromEntries(Object.entries(next).filter(([, e]) => existsSync(e.path)))
    writeFileSync(registryPath, `${JSON.stringify(alive, null, 2)}\n`)
    return current?.slot
  })
  const envFile = join(worktree, SLOT_ENV_FILE)
  if (existsSync(envFile)) {
    writeFileSync(envFile, clearEnvKeys(readFileSync(envFile, 'utf8'), ORCA_KEYS))
  }
  if (!slot) {
    print('Este worktree não tem slot: nada a liberar.')
    return
  }
  print(`Slot ${slot} liberado.`)
}

function main() {
  const { values, positionals } = parseArgs({
    options: { help: { type: 'boolean', short: 'h' } },
    allowPositionals: true,
    strict: true,
  })
  if (values.help) {
    print('Uso: pnpm orca:clean [report|archive|teardown]')
    print('  report     lista slots (padrão)')
    print('  archive|teardown  libera o slot deste worktree')
    return
  }
  const command = positionals[0] || (process.env.ORCA_ARCHIVE ? 'archive' : 'report')
  // orca.yaml archive hook calls plain `pnpm orca:clean` — treat as teardown when not TTY report intent
  const effective = command === 'report' ? 'report'
    : (command === 'archive' || command === 'teardown' || command === undefined) ? 'archive'
    : command

  const worktree = resolve(git('rev-parse', '--show-toplevel'))
  const gitCommonDir = resolve(git('rev-parse', '--path-format=absolute', '--git-common-dir'))
  const primary = dirname(gitCommonDir)

  // Hook archive do Orca chama sem args: liberar slot (não report interativo).
  if (positionals.length === 0) {
    if (pathKey(worktree) === pathKey(primary)) {
      print('Checkout primário: nada a liberar.')
      return
    }
    release(gitCommonDir, worktree)
    return
  }

  if (effective === 'report') status(gitCommonDir, primary)
  else if (effective === 'archive') {
    if (pathKey(worktree) === pathKey(primary)) fail('o checkout primário não tem slot para liberar')
    release(gitCommonDir, worktree)
  } else fail(`comando desconhecido: ${command}`)
}

try { main() } catch (error) { fail(error instanceof Error ? error.message : String(error)) }
