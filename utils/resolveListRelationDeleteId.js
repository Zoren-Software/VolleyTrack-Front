/**
 * ZDatatableGeneric / ZDataTableActions emitem o id numérico da linha.
 * Mantém compatibilidade se algo repassar { id: n }.
 *
 * @param {number|string|{ id?: number|string }|null|undefined} payload
 * @returns {number|null}
 */
export function resolveListRelationDeleteId (payload) {
  if (payload == null || payload === '') {
    return null
  }
  if (typeof payload === 'object' && payload !== null && payload.id != null && payload.id !== '') {
    const n = Number(payload.id)
    return Number.isNaN(n) ? null : n
  }
  const n = Number(payload)
  return Number.isNaN(n) ? null : n
}
