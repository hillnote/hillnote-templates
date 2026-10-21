/**
 * Archive-entry safety guards, mirroring the checks the Hillnote app applies
 * in its install pipeline (zip-slip, absolute paths, null bytes, symlink
 * entries via unix mode 0xA000 in the zip external attributes).
 *
 * Kept as a separate module so scripts/test-guards.mjs can exercise them
 * against hand-crafted hostile archives — adm-zip's *writer* normalizes
 * traversal names, so only a raw crafted zip proves the read-side guards.
 */

/** Returns a human-readable problem string for an entry name, or null if safe. */
export function entryNameIssue(rawName) {
  const name = String(rawName || '').replace(/\\/g, '/')
  if (!name || name.includes('\0')) return 'empty or null-byte entry name'
  if (name.startsWith('/')) return 'absolute path'
  if (/(^|\/)\.\.($|\/)/.test(name)) return 'path traversal (`..`)'
  return null
}

/** True when a zip entry is a symlink (unix mode in the external attrs). */
export function isSymlinkEntry(zipEntry) {
  return ((zipEntry.header.attr >>> 16) & 0xF000) === 0xA000
}
