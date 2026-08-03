import React from 'react'

import { classes } from '../utils'

type Props = {
  colorScheme?:
    | 'gray'
    | 'red'
    | 'green'
    | 'darkGreen'
    | 'blue'
    | 'yellow'
    | 'amber'
    | 'sunset'
    | 'neutral'
    | 'brand'
  size?: 'sm' | 'default' | 'lg' | 'xs'
}

export type BadgeProps = Props & React.HTMLAttributes<HTMLSpanElement>

export default function Badge({
  colorScheme = 'gray',
  size = 'default',
  /** External classNames */
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={classes(
        'inline-flex items-center rounded-full font-medium',
        { 'px-3 py-0.5 text-sm': size === 'default' },
        { 'px-1.5 py-0.5 text-sm': size === 'sm' },
        { 'px-1.5 py-0.5 text-xs': size === 'xs' },
        { 'px-3.5 py-1': size === 'lg' },
        {
          'bg-gray-100 text-gray-800 dark:bg-gray-200': colorScheme === 'gray',
        },
        {
          'bg-red-100 text-red-800 dark:bg-red-200': colorScheme === 'red',
        },
        {
          'bg-green-100 text-green-800 dark:bg-green-200':
            colorScheme === 'green',
        },
        {
          'bg-green-800 text-white': colorScheme === 'darkGreen',
        },
        {
          'bg-blue-100 text-blue-800 dark:bg-blue-200': colorScheme === 'blue',
        },
        {
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-200':
            colorScheme === 'yellow',
        },
        {
          'bg-amber-100 text-amber-800 dark:bg-amber-200':
            colorScheme === 'amber',
        },
        {
          'bg-sunset-50 text-sunset': colorScheme === 'sunset',
        },
        {
          'bg-background-surface-secondary text-foreground-normal':
            colorScheme === 'neutral',
        },
        {
          'bg-primary text-foreground-on-brand-primary':
            colorScheme === 'brand',
        },
        className,
      )}
      {...props}
    />
  )
}
