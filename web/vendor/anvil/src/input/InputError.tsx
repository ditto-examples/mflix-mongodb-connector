import React from 'react'

import { classes } from '../utils'

export type Props = {
  /** Error message */
  message: string
  /** External className */
  className?: string
} & React.HtmlHTMLAttributes<HTMLDivElement>

/** Renders an error message on forms */
const InputError = ({ message, className, ...other }: Props) => {
  return (
    <div
      className={classes('text-fill-critical mt-1.5 text-xs', className)}
      {...other}
    >
      {message}
    </div>
  )
}

export default InputError
