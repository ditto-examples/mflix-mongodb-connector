import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
  XIcon,
} from '@phosphor-icons/react'
import cx from 'classnames'
import React, { ComponentProps, useContext, useEffect, useState } from 'react'
import { Portal } from 'react-portal'

import { Button } from '../button'
import { Icon } from '../icon'
import { Heading } from '../typography'
import AlertContext from './context'

export const DEFAULT_ALERT_DISMISS_TIMEOUT = 5000

export type AlertProps = {
  /** Alert message variant. */
  variant: 'danger' | 'warning' | 'info' | 'success'
  /** Alert message body. */
  children: React.ReactNode
  /** Indicates whether alert should be dismissed automatically. */
  autoDismiss?: boolean
  /** Close alert callback. */
  onClose?: () => void
  /** Additional class names. */
  className?: string
}

const variantIcon = {
  success: CheckCircleIcon,
  danger: XCircleIcon,
  warning: WarningIcon,
  info: InfoIcon,
} as const

/** Alert message that appears on the bottom of the page. */
export default function Alert({
  variant,
  children,
  autoDismiss,
  onClose,
  className,
  ...rest
}: AlertProps) {
  const { parentNodeId } = useContext(AlertContext)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (autoDismiss && isOpen) {
      const t = setTimeout(() => {
        setIsOpen(false)
      }, DEFAULT_ALERT_DISMISS_TIMEOUT)

      return () => {
        clearTimeout(t)
      }
    }
  }, [autoDismiss, isOpen])

  if (!isOpen || !parentNodeId) {
    return null
  }

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) {
      onClose()
    }
  }

  const VariantIcon = variantIcon[variant]

  return (
    <Portal node={document.getElementById(parentNodeId)}>
      <div
        data-testid="alert"
        className={cx(
          'mx-auto flex items-start gap-x-2 rounded-lg border px-3 sm:w-[90%]',
          className,
          {
            'border-border-success bg-fill-success-secondary':
              variant === 'success',
            'border-border-critical bg-fill-critical-secondary':
              variant === 'danger',
            'border-border-warning bg-fill-warning-secondary':
              variant === 'warning',
            'border-border-info bg-fill-info-secondary': variant === 'info',
          },
        )}
        {...rest}
      >
        <div className="grid place-items-center py-3.5">
          <Icon svg={<VariantIcon />} />
        </div>

        <div className="text-foreground-normal flex-1 py-3.5 text-base">
          {children}
        </div>

        <div className="ml-6 grid place-items-center py-2">
          <Button
            data-testid="closeButton"
            aria-label="Close"
            onClick={handleClose}
            size="icon"
            className={cx('border-0 bg-transparent p-4 shadow-none', {
              'hover:bg-fill-success-secondary!': variant === 'success',
              'hover:bg-fill-critical-secondary!': variant === 'danger',
              'hover:bg-fill-warning-secondary!': variant === 'warning',
              'hover:bg-fill-info-secondary!': variant === 'info',
            })}
          >
            <Icon svg={<XIcon />} className="text-foreground-normal" />
          </Button>
        </div>
      </div>
    </Portal>
  )
}

type AlertTitleProps = ComponentProps<'h3'>
export const AlertTitle = ({ className, ...rest }: AlertTitleProps) => {
  return (
    <Heading
      level={3}
      className={cx('text-foreground-normal font-medium', className)}
      {...rest}
    />
  )
}

type AlertBodyProps = ComponentProps<'div'>
export const AlertBody = ({ className, ...rest }: AlertBodyProps) => {
  return (
    <div
      className={cx(
        'text-foreground-normal mt-2 text-sm font-normal',
        className,
      )}
      {...rest}
    />
  )
}

Alert.Title = AlertTitle
Alert.Body = AlertBody
Alert.defaultProps = {
  autoDismiss: true,
}
