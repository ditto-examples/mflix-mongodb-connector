import { Tag, TagInput, TagInputProps } from 'emblor'
import React, { forwardRef } from 'react'

import { classes } from '../utils'
import { chipClassNames } from './Chip'

const ChipInput = forwardRef<HTMLInputElement, TagInputProps>(
  ({ styleClasses, ...props }, ref) => {
    return (
      <TagInput
        ref={ref}
        styleClasses={{
          ...styleClasses,
          inlineTagsContainer: classes(
            'border-border-normal text-foreground-normal placeholder:text-foreground-subtle relative flex min-h-8 w-full flex-wrap items-center gap-1 rounded-md border bg-transparent p-1.5 text-left outline-none ring-0 transition-colors',
            'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
            {
              'cursor-not-allowed opacity-50': props.disabled,
            },
            styleClasses?.inlineTagsContainer,
          ),
          input: classes(
            'text-foreground-normal placeholder:text-foreground-subtle h-5 w-fit flex-1 border-0 bg-transparent p-0 text-sm shadow-none outline-none! ring-0!',
            styleClasses?.input,
          ),
          tag: {
            body: classes(chipClassNames.body, styleClasses?.tag?.body),
            closeButton: classes(
              chipClassNames.removeButton,
              styleClasses?.tag?.closeButton,
            ),
          },
        }}
        {...props}
        inputProps={{
          ...props.inputProps,
          // @ts-expect-error: This should exist
          'data-testid': 'chipInput',
        }}
      />
    )
  },
)
ChipInput.displayName = 'ChipInput'

export { ChipInput }
export type { Tag as Chip }
