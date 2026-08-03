import React from 'react'

import { classes } from '../utils'

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4
  className?: string
}

const headingStyles = {
  1: 'font-kairos text-2xl sm:text-3xl leading-8 text-foreground-normal antialiased mb-2',
  2: 'font-sans text-xl sm:text-2xl font-medium leading-6 text-foreground-normal antialiased mb-2',
  3: 'font-sans text-base sm:text-lg font-medium leading-normal text-foreground-normal antialiased mb-1',
  4: 'font-sans text-sm leading-normal font-medium text-foreground-normal antialiased mb-0.5',
} as const

export const Heading = ({
  level,
  children,
  className,
  ...props
}: HeadingProps) => {
  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'

  return (
    <HeadingTag className={classes(headingStyles[level], className)} {...props}>
      {children}
    </HeadingTag>
  )
}
