import { CheckIcon, CopyIcon } from '@phosphor-icons/react'
import React, {
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Button } from '../button'
import { useCopyToClipboard } from '../hooks'
import { Icon } from '../icon'
import { classes } from '../utils'

export type TableCellProps = ComponentPropsWithoutRef<'td'> & {
  activeOnHover?: boolean
  enableCopy?: boolean
}

export function TableCell({
  className,
  activeOnHover,
  enableCopy,
  children,
  ...props
}: TableCellProps) {
  const cellRef = useRef<HTMLTableCellElement>(null)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (cellRef.current) {
      setContent(cellRef.current.textContent || '')
    }
  }, [children])

  const [copyToClipboard, copied, canCopy] = useCopyToClipboard(content, 2000)

  const handleCopyClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      copyToClipboard()
    },
    [copyToClipboard],
  )

  return (
    <td
      ref={cellRef}
      className={classes(
        'border-b-border-normal group relative border-b px-1.5',
        {
          'cursor-pointer': activeOnHover,
        },
        className,
      )}
      {...props}
    >
      {children}

      {enableCopy && canCopy && (
        <div
          data-testid="copy-cell"
          className="group-hover:bg-background-surface absolute bottom-0 right-0 top-0 z-10 w-8 p-1 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="bg-background-surface-hovered absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-md p-1"
            onClick={handleCopyClick}
            title="Copy to clipboard"
            aria-label="Copy to clipboard"
            data-testid="copy-cell-button"
          >
            {copied ? (
              <Icon className="size-3.5" svg={<CheckIcon />} />
            ) : (
              <Icon className="size-3.5" svg={<CopyIcon />} />
            )}
          </Button>
        </div>
      )}
    </td>
  )
}
