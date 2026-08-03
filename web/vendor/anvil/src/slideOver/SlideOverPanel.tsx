import { Transition } from '@headlessui/react'
import cx from 'classnames'
import React from 'react'

import { classes } from '../utils'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
}

type Props = {
  /** True if the slide over panel is open */
  isOpen: boolean
  /** Child components that should be shown on the panel. */
  children: React.ReactNode
  /** Class name applied to the outermost container of the panel. */
  wrapperClassName?: string
  /** Class name applied to the inner panel. */
  className?: string
  /** Class name applied to the outer container of the panel. */
  containerClassName?: string
  /** Optional size of the panel. Defaults to 'md' */
  size?: keyof typeof SIZES
}

/** Slide over panel with a sticky footer. Based on Tailwind UI's panel:
 *
 * https://tailwindui.com/components/application-ui/overlays/slide-overs#component-ec28d8520d4af86eaacce43859f9c34a
 *
 */
const SlideOverPanel = ({
  isOpen,
  children,
  className,
  containerClassName,
  wrapperClassName,
  size = 'md',
}: Props) => {
  return (
    <section
      className={classes(
        'absolute inset-y-0 right-0 z-10 flex max-w-full pl-10',
        {
          'pointer-events-none': !isOpen,
        },
        wrapperClassName,
      )}
      aria-labelledby="slide-over-heading"
    >
      <Transition
        show={isOpen}
        enter="transition ease-in-out duration-500 sm:duration-700"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-500 sm:duration-700"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
        as="div"
      >
        <div
          className={classes(
            // NOTE: on mobile, offset the pl-10
            'h-full w-[calc(100vw-2.5rem)] sm:w-screen',
            SIZES[size || 'md'] || SIZES.md,
            containerClassName,
          )}
        >
          <div className={cx('flex h-full flex-col shadow-xl', className)}>
            {children}
          </div>
        </div>
      </Transition>
    </section>
  )
}

export default SlideOverPanel
