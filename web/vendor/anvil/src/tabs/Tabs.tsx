import * as TabsPrimitive from '@radix-ui/react-tabs'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { classes } from '../utils'

function TabsRoot({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={classes(
        'group/tabs flex items-start data-[orientation=horizontal]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex items-center justify-center text-foreground-subtle group-data-[orientation=vertical]/tabs:flex-col h-8 group-data-[orientation=vertical]/tabs:h-auto',
  {
    variants: {
      variant: {
        default: 'rounded-lg p-0.5 shadow-inner border-border-normal border',
        pill: 'gap-1',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant ?? 'default'}
      className={classes(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={classes(
        'text-foreground-subtle relative inline-flex h-full items-center justify-center whitespace-nowrap px-2 text-base transition-all',
        'group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start',
        'group-data-[orientation=vertical]/tabs:h-8',
        'hover:text-foreground-normal',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        // default
        'group-data-[variant=default]/tabs-list:rounded-[calc(var(--radius-lg)-2px)]',
        'group-data-[variant=default]/tabs-list:data-[state=active]:bg-fill-control-selected group-data-[variant=default]/tabs-list:data-[state=active]:text-white',
        // pill
        'group-data-[variant=pill]/tabs-list:data-[state=active]:bg-primary group-data-[variant=pill]/tabs-list:data-[state=active]:text-foreground-on-brand-primary group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:px-3',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={classes('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})
