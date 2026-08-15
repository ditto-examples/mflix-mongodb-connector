import React, { PropsWithChildren } from 'react'

import { classes } from '../utils'
import { BaseTooltip } from './base'

type Props = PropsWithChildren<
  Pick<
    React.ComponentProps<typeof BaseTooltip.Content>,
    'align' | 'sideOffset' | 'alignOffset' | 'side'
  > & {
    tip: string
    disabled?: boolean
  }
>
function Tooltip({ children, tip, disabled, ...props }: Props) {
  return (
    <BaseTooltip>
      <BaseTooltip.Trigger
        disabled={disabled}
        asChild
        className={classes({ 'pointer-events-none': disabled })}
      >
        {children}
      </BaseTooltip.Trigger>
      <BaseTooltip.Content {...props}>{tip}</BaseTooltip.Content>
    </BaseTooltip>
  )
}

export default Tooltip
