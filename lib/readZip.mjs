/**
 * Strict, dependency-free zip READER for the archives this repo consumes —
 * plugin release archives inlined at build time, and our own template zips in
 * the tests. Deliberately narrower than a general unzip:
 *
 *   - the central directory is authoritative; every local header must agree
 *   - methods 0 (store) and 8 (deflate) only; no encryption, no zip64, no
 *     multi-disk archives
 *   - declared sizes are capped BEFORE inflating, and inflation itself is
 *     bounded (maxOutputLength) — a deflate bomb that understates its size is
 *     cut off instead of filling memory
 *   - the inflated size and CRC-32 must match the central directory
 *   - duplicate names are refused (two readers could pick different copies)
 *
 * Name safety (traversal, absolute, symlinks) is the caller's job — see
 * lib/archiveGuards.mjs — so a hostile name is RETURNED for the caller to
 * reject with a precise message rather than silently dropped here.
 */
import zlib from 'node:zlib'
import { crc32 } from './buildZip.mjs'

const DEFAULT_LIMITS = {
  maxEntries: 5000,
  maxFileBytes: 25 * 1024 * 1024,
  maxTotalBytes: 200 * 1024 * 1024,
}

const fail = (msg) => { throw new Error(`Invalid zip: ${msg}`) }

/**
 * @param {Buffer} buf
 * @param {{ maxEntries?: number, maxFileBytes?: number, maxTotalBytes?: number }} [limits]
 * @returns {{ name: string, data: Buffer, isDirectory: boolean, isSymlink: boolean, externalAttr: number }[]}
 */
export function readZip(buf, limits = {}) {
  const lim = { ...DEFAULT_LIMITS, ...limits }
  if (!Buffer.isBuffer(buf) || buf.length < 22) fail('too small')

  // End of central directory: the last signature within the 64 KB comment window.
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xffff); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) fail('no end-of-central-directory record')
  const diskNo = buf.readUInt16LE(eocd + 4)
  const cdDisk = buf.readUInt16LE(eocd + 6)
  const onDisk = buf.readUInt16LE(eocd + 8)
  const total = buf.readUInt16LE(eocd + 10)
  const cdSize = buf.readUInt32LE(eocd + 12)
  const cdOffset = buf.readUInt32LE(eocd + 16)
  if (diskNo !== 0 || cdDisk !== 0 || onDisk !== total) fail('multi-disk archives are not supported')
  if (total === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) fail('zip64 archives are not supported')
  if (total > lim.maxEntries) fail(`more than ${lim.maxEntries} entries`)
  if (cdOffset + cdSize > eocd) fail('central directory out of bounds')

  const out = []
  const names = new Set()
  let declaredTotal = 0
  let actualTotal = 0
  let p = cdOffset
  for (let n = 0; n < total; n++) {
    if (p + 46 > eocd || buf.readUInt32LE(p) !== 0x02014b50) fail('corrupt central directory')
    const flags = buf.readUInt16LE(p + 8)
    const method = buf.readUInt16LE(p + 10)
    const crc = buf.readUInt32LE(p + 16)
    const compSize = buf.readUInt32LE(p + 20)
    const size = buf.readUInt32LE(p + 24)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const externalAttr = buf.readUInt32LE(p + 38)
    const localOffset = buf.readUInt32LE(p + 42)
    if (p + 46 + nameLen > eocd) fail('corrupt central directory')
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString('utf8')
    p += 46 + nameLen + extraLen + commentLen

    if (flags & 0x0001) fail(`${name}: encrypted entries are not supported`)
    if (compSize === 0xffffffff || size === 0xffffffff || localOffset === 0xffffffff) fail(`${name}: zip64 entries are not supported`)
    if (names.has(name)) fail(`duplicate entry ${name}`)
    names.add(name)

    const isDirectory = name.endsWith('/')
    const isSymlink = ((externalAttr >>> 16) & 0xf000) === 0xa000
    if (size > lim.maxFileBytes) fail(`${name}: larger than ${lim.maxFileBytes} bytes`)
    declaredTotal += size
    if (declaredTotal > lim.maxTotalBytes) fail(`unpacks to more than ${lim.maxTotalBytes} bytes`)

    if (localOffset + 30 > cdOffset || buf.readUInt32LE(localOffset) !== 0x04034b50) fail(`${name}: bad local header`)
    const localNameLen = buf.readUInt16LE(localOffset + 26)
    const localExtraLen = buf.readUInt16LE(localOffset + 28)
    const localName = buf.subarray(localOffset + 30, localOffset + 30 + localNameLen).toString('utf8')
    if (localName !== name) fail(`${name}: local header names a different file`)
    const start = localOffset + 30 + localNameLen + localExtraLen
    if (start + compSize > cdOffset) fail(`${name}: data out of bounds`)
    const raw = buf.subarray(start, start + compSize)

    let data
    if (method === 0) {
      if (compSize !== size) fail(`${name}: stored size mismatch`)
      data = Buffer.from(raw)
    } else if (method === 8) {
      try {
        // One byte of headroom: an entry that inflates past its declared size
        // is detected (and refused) instead of truncated to look valid.
        data = zlib.inflateRawSync(raw, { maxOutputLength: Math.max(1, size + 1) })
      } catch (err) {
        fail(`${name}: inflate failed (${err.code || err.message})`)
      }
    } else {
      fail(`${name}: compression method ${method} is not supported`)
    }
    if (data.length !== size) fail(`${name}: inflated size does not match the declared size`)
    if (crc32(data) !== crc) fail(`${name}: CRC mismatch`)
    actualTotal += data.length
    if (actualTotal > lim.maxTotalBytes) fail(`unpacks to more than ${lim.maxTotalBytes} bytes`)

    out.push({ name, data, isDirectory, isSymlink, externalAttr })
  }
  return out
}
