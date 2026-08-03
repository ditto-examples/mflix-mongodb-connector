import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react'
import * as React from 'react'
import { Toaster as Sonner } from 'sonner'

import { useDetectTheme } from '../hooks'
import { Icon } from '../icon'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useDetectTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      richColors
      icons={{
        success: <Icon className="size-4" svg={<CheckCircleIcon />} />,
        info: <Icon className="size-4" svg={<InfoIcon />} />,
        warning: <Icon className="size-4" svg={<WarningIcon />} />,
        error: <Icon className="size-4" svg={<XCircleIcon />} />,
      }}
      style={
        {
          '--normal-bg': 'var(--background-overlay)',
          '--normal-text': 'var(--foreground-normal)',
          '--normal-border': 'var(--border-normal)',
          '--success-bg': 'var(--fill-success-secondary)',
          '--success-text': 'var(--foreground-normal)',
          '--success-border': 'var(--border-success)',
          '--info-bg': 'var(--fill-info-secondary)',
          '--info-text': 'var(--foreground-normal)',
          '--info-border': 'var(--border-info)',
          '--warning-bg': 'var(--fill-warning-secondary)',
          '--warning-text': 'var(--foreground-normal)',
          '--warning-border': 'var(--border-warning)',
          '--error-bg': 'var(--fill-critical-secondary)',
          '--error-text': 'var(--foreground-normal)',
          '--error-border': 'var(--border-critical)',
          '--border-radius': 'var(--radius-lg)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
