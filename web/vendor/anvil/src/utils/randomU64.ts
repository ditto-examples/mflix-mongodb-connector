/** Generates a random 64Bit */
const randomU64 = (): bigint => {
  return BigInt(
    `0x${new Array(16)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')}`,
  )
}

export default randomU64
