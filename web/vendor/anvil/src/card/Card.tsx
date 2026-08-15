import React, { forwardRef } from 'react'

import { classes } from '../utils'

type Props = {
  /**
   * Additional classNames on the card container.
   */
  className?: string
  /** Card contents */
  children: React.ReactNode
  /**
   * Determines if the card should divide the children with a border.
   */
  isDivided?: boolean
}

// Card used to group items
const Card = forwardRef<HTMLDivElement, Props>(
  ({ className, children, isDivided }, ref) => {
    return (
      <div
        ref={ref}
        className={classes(
          'bg-background-surface border-border-normal rounded-xl border shadow-lg',
          { 'divide-border-normal divide-y': isDivided },
          className,
        )}
      >
        {children}
      </div>
    )
  },
)
Card.displayName = 'Card'

type CardSubComponentProps = {
  /**
   * Determines if the subcomponent will have any padding. If this value is true, then there will be no padding.
   **/
  isFlushed?: boolean
} & React.HTMLAttributes<HTMLDivElement>

const CardBody = forwardRef<HTMLDivElement, CardSubComponentProps>(
  ({ children, isFlushed, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classes({ 'px-4 py-5 sm:p-6': !isFlushed }, className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
CardBody.displayName = 'CardBody'

const CardHeader = ({
  children,
  isFlushed,
  className,
  ...props
}: CardSubComponentProps) => {
  return (
    <div
      className={classes(
        {
          'px-4 pt-5 sm:px-6 sm:pt-6': !isFlushed,
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const CardFooter = ({
  children,
  isFlushed,
  className,
  ...props
}: CardSubComponentProps) => {
  return (
    <div
      className={classes(
        'flex justify-end',
        {
          'px-4 py-5 sm:px-6': !isFlushed,
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * A generic spacer component that applies a uniform vertical spacing. This is mostly
 * to help with vertical spacing between card elements that have `isFlushed` set to true.
 */
const CardSpacer = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={classes('h-5 sm:h-6', className)} {...props} />
}

const TypedCard = Card as typeof Card & {
  Body: typeof CardBody
  Header: typeof CardHeader
  Footer: typeof CardFooter
  Spacer: typeof CardSpacer
}
TypedCard.Body = CardBody
TypedCard.Header = CardHeader
TypedCard.Footer = CardFooter
TypedCard.Spacer = CardSpacer

export default TypedCard
