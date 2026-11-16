#!/usr/bin/env node
/**
 * Selftest do orca:setup / orca:clean (CI): worktree temporário, --skip-install, assert .env.local.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const wt = mkdtempSync(join(tmpdir(), 'orca-front-'))
const branch = `selftest/orca-${process.pid}`

function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
}

function run(cmd, cwd = root) {
  execFileSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe', shell: true })
}

function fail(msg) {
  console.error(`Erro: ${msg}`)
  process.exit(1)
}

try {
  console.log('== slot 0 no principal ==')
  const primaryOut = execFileSync('node', ['scripts/orca-setup.mjs', '--skip-install'], {
    cwd: root, encoding: 'utf8',
  })
  if (!primaryOut.includes('slot 0')) fail('setup no principal não reportou slot 0')

  console.log('== worktree setup ==')
  git('worktree', 'add', '-b', branch, wt, 'HEAD')
  execFileSync('cp', ['scripts/orca-setup.mjs', 'scripts/orca-clean.mjs', join(wt, 'scripts')])

  const setupOut = execFileSync('node', ['scripts/orca-setup.mjs', '--skip-install'], {
    cwd: wt, encoding: 'utf8',
  })
  if (!setupOut.includes('slot 1')) fail('setup do worktree não reportou slot 1')

  const envLocal = join(wt, '.env.local')
  if (!existsSync(envLocal)) fail('faltou .env.local')
  const envText = readFileSync(envLocal, 'utf8')
  if (!/^ORCA_SLOT=1$/m.test(envText)) fail('ORCA_SLOT != 1')
  if (!/^PORT=\d+$/m.test(envText)) fail('PORT ausente')

  const registry = join(root, '.git', 'orca-slots.json')
  if (!existsSync(registry)) fail('faltou orca-slots.json')
  if (!readFileSync(registry, 'utf8').includes(wt)) fail('registry sem o worktree')

  console.log('== clean (libera slot) ==')
  const cleanOut = execFileSync('node', ['scripts/orca-clean.mjs'], { cwd: wt, encoding: 'utf8' })
  if (!cleanOut.includes('liberado')) fail('clean não liberou slot')
  if (existsSync(registry) && readFileSync(registry, 'utf8').includes(wt)) {
    fail('registry ainda tem o worktree')
  }

  console.log('orca-selftest OK')
} finally {
  try { git('worktree', 'remove', wt, '--force') } catch { rmSync(wt, { recursive: true, force: true }) }
  try { git('branch', '-D', branch) } catch { /* ignore */ }
  try { rmSync(join(root, '.git', 'orca-slots.json'), { force: true }) } catch { /* ignore */ }
}
