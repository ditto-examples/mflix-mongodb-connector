import { DotsSixIcon } from '@phosphor-icons/react'
import * as React from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'

import { Icon } from '../icon'
import { classes } from '../utils'

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={classes(
        'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  onPointerDownCapture,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={classes(
        'bg-border-normal focus-visible:ring-focus-outline relative flex w-px items-center justify-center outline-none after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
        className,
      )}
      onPointerDownCapture={(event) => {
        const resizeHandle = event.currentTarget as unknown as HTMLElement
        resizeHandle.setPointerCapture?.(event.pointerId)
        onPointerDownCapture?.(event)
      }}
      {...props}
    >
      {withHandle && (
        <div className="bg-background-surface rounded-xs border-border-normal text-foreground-normal z-10 flex h-4 w-3 items-center justify-center border">
          <Icon className="size-2.5 rotate-90" svg={<DotsSixIcon />} />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
