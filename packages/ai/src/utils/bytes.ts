/** 把多个 Uint8Array 片段拼接成一个；只有一个片段时直接返回它（免拷贝）。 */
export const concatBytes = (chunks: ReadonlyArray<Uint8Array>) => {
  if (chunks.length === 1) return chunks[0]
  const bytes = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0))
  chunks.reduce((offset, chunk) => {
    bytes.set(chunk, offset)
    return offset + chunk.length
  }, 0)
  return bytes
}
