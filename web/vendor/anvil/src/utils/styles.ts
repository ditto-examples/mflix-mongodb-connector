import { cx, CxOptions } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

/** A utility function to merge/normalize class names in one pass */
export default function classes(...args: CxOptions) {
  return twMerge(cx(args))
}
