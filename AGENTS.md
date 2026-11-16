## Worktrees do Orca

Num worktree criado pelo Orca, `pnpm orca:setup` (hook do `orca.yaml`) reserva um slot (1–9),
grava `PORT`/`ORCA_SLOT` no `.env.local` (porta `3000+N×10`), copia o `.env` do
checkout principal e instala as deps. Opcionalmente aponta o front para o back do mesmo issue
(via registry `orca-slots.tsv` do back).

- Dev: `pnpm dev` na porta do slot
- Status/liberar: `pnpm orca:clean report` · `pnpm orca:clean` (archive libera o slot)
- Ao arquivar: o hook `archive` do Orca chama `pnpm orca:clean`

O checkout principal continua nas portas padrão (sem slot).
