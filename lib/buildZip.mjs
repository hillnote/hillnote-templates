/**
 * Deterministic STORE-only zip writer — ported from hillnote.com's tool-catalog
 * builder (HillnoteWebsite/backend/services/toolCatalog/buildCatalog.js).
 *
 * Same input → byte-identical output, every time and on every machine:
 *   - fixed timestamp (1980-01-01 00:00:00, the DOS epoch)
 *   - entries sorted by the BYTE order of their UTF-8 names
 *   - regular files only (no directory entries, no symlinks), mode 0644
 *   - method 0 (store): no compressor whose output could change between
 *     zlib versions, so a template's sha256 only moves when its content does
 *
 * The zip root is the workspace root (docs/WORKSPACE_TEMPLATES.md §2).
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    t[n] = c >>> 0
  }
  return t
})()

export function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const DOS_TIME = 0
const DOS_DATE = 0x21 // 1980-01-01
const MADE_BY_UNIX = 0x0314 // host 3 (Unix), spec 2.0
const REGULAR_FILE_ATTR = (0o100644 << 16) >>> 0

/**
 * @param {{ name: string, data: Buffer }[]} entries  workspace-relative names, forward slashes
 * @returns {Buffer}
 */
export function buildZip(entries) {
  const named = entries.map(({ name, data }) => {
    if (typeof name !== 'string' || !name || name.endsWith('/') || name.startsWith('/')) {
      throw new Error(`buildZip: invalid entry name ${JSON.stringify(name)}`)
    }
    if (!Buffer.isBuffer(data)) throw new Error(`buildZip: ${name} has no Buffer data`)
    return { name, nameBuf: Buffer.from(name, 'utf8'), data }
  })
  named.sort((a, b) => Buffer.compare(a.nameBuf, b.nameBuf))
  for (let i = 1; i < named.length; i++) {
    if (Buffer.compare(named[i - 1].nameBuf, named[i].nameBuf) === 0) {
      throw new Error(`buildZip: duplicate entry ${named[i].name}`)
    }
  }
  if (named.length > 0xffff) throw new Error('buildZip: too many entries for a non-zip64 archive')

  const parts = []
  const central = []
  let offset = 0
  for (const { nameBuf, data } of named) {
    const crc = crc32(data)

    const lh = Buffer.alloc(30)
    lh.writeUInt32LE(0x04034b50, 0)
    lh.writeUInt16LE(20, 4)        // version needed
    lh.writeUInt16LE(0x0800, 6)    // bit 11: UTF-8 names
    lh.writeUInt16LE(0, 8)         // method 0: store
    lh.writeUInt16LE(DOS_TIME, 10)
    lh.writeUInt16LE(DOS_DATE, 12)
    lh.writeUInt32LE(crc, 14)
    lh.writeUInt32LE(data.length, 18)
    lh.writeUInt32LE(data.length, 22)
    lh.writeUInt16LE(nameBuf.length, 26)
    lh.writeUInt16LE(0, 28)
    parts.push(lh, nameBuf, data)

    const ch = Buffer.alloc(46)
    ch.writeUInt32LE(0x02014b50, 0)
    ch.writeUInt16LE(MADE_BY_UNIX, 4)
    ch.writeUInt16LE(20, 6)
    ch.writeUInt16LE(0x0800, 8)
    ch.writeUInt16LE(0, 10)
    ch.writeUInt16LE(DOS_TIME, 12)
    ch.writeUInt16LE(DOS_DATE, 14)
    ch.writeUInt32LE(crc, 16)
    ch.writeUInt32LE(data.length, 20)
    ch.writeUInt32LE(data.length, 24)
    ch.writeUInt16LE(nameBuf.length, 28)
    ch.writeUInt16LE(0, 30)        // extra
    ch.writeUInt16LE(0, 32)        // comment
    ch.writeUInt16LE(0, 34)        // disk start
    ch.writeUInt16LE(0, 36)        // internal attrs
    ch.writeUInt32LE(REGULAR_FILE_ATTR, 38)
    ch.writeUInt32LE(offset, 42)
    central.push(ch, nameBuf)

    offset += lh.length + nameBuf.length + data.length
    if (offset > 0xffffffff) throw new Error('buildZip: archive larger than 4 GB')
  }

  const cd = Buffer.concat(central)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(named.length, 8)
  eocd.writeUInt16LE(named.length, 10)
  eocd.writeUInt32LE(cd.length, 12)
  eocd.writeUInt32LE(offset, 16)
  return Buffer.concat([...parts, cd, eocd])
}
