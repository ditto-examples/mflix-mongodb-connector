// Workaround: safe-stable-stringify's package.json `exports` field doesn't
// declare a "types" condition, which prevents TypeScript (with
// `moduleResolution: bundler`) from finding its declaration file.
declare module 'safe-stable-stringify' {
  export interface StringifyOptions {
    bigint?: boolean
    circularValue?: string | null | TypeErrorConstructor | ErrorConstructor
    deterministic?: boolean
    maximumBreadth?: number
    maximumDepth?: number
  }

  type Replacer =
    | ((key: string, value: unknown) => unknown)
    | (number | string)[]
    | null

  export function stringify(
    value: unknown,
    replacer?: Replacer,
    space?: string | number,
  ): string

  export function configure(options: StringifyOptions): typeof stringify

  export default stringify
}
