import React from 'react'

import { Heading } from '../typography'
import { classes } from '../utils'

interface TwoColumnProps {
  firstColumnTitle?: string
  firstColumnContent?:
    | string
    | React.ReactNode
    | React.ReactElement
    | JSX.Element
  children: React.ReactNode
  containerClassName?: string
  firstColumnContainerClassName?: string
}

export const TwoColumn = ({
  containerClassName,
  firstColumnTitle,
  firstColumnContent,
  firstColumnContainerClassName,
  children,
}: TwoColumnProps) => {
  return (
    <div
      className={classes(
        'py-5 md:grid md:grid-cols-12 md:gap-6',
        containerClassName,
      )}
    >
      <div className="md:col-span-4">
        <div className={classes('px-4 sm:px-0', firstColumnContainerClassName)}>
          {firstColumnTitle && <Heading level={2}>{firstColumnTitle}</Heading>}
          {typeof firstColumnContent === 'string' ? (
            <p className="text-foreground-subtle font-sans">
              {firstColumnContent}
            </p>
          ) : (
            <div className="text-foreground-subtle font-sans">
              {firstColumnContent}
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 md:col-span-7 md:col-start-6 md:mt-0">
        {children}
      </div>
    </div>
  )
}
