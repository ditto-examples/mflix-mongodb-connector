import React, { forwardRef } from 'react'
import { NavLink as RRLink } from 'react-router-dom'

import { classes } from '../utils'

export type RawLinkProps = {
  /** Used for internal application paths. */
  to?: string
  /** For passing state on RR links. */
  state?: Record<string, unknown>
  /** Used for external application paths. */
  href?: string
  /** True if a blank reference is used. */
  isBlank?: boolean
  /** Child elements */
  children: React.ReactNode
  /** Optional className */
  className?: string
  /** Optional onClick handler */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  /** Prevents the link from receiving focus or being activated. */
  disabled?: boolean
  /** Optional role */
  role?: 'button' | 'link'
  /** True if an end link should be rendered. */
  end?: boolean
  /** HTML id value. */
  id?: string
  /** Active className for RR links */
  activeClassName?: string
  /** Defined for file downloads. Contains the name of the downloaded file.*/
  download?: string
  /** Whether to force the browser to reload the page when navigating to the link */
  reloadDocument?: boolean
  /** The title of the link. */
  title?: string
}

/** Link component used to render a router link or an a tag. */
const RawLink = forwardRef(
  (
    {
      to,
      state,
      href,
      children,
      isBlank,
      className,
      end,
      activeClassName,
      disabled,
      onClick,
      ...other
    }: RawLinkProps,
    ref: React.Ref<HTMLAnchorElement>,
  ) => {
    let internalProps = {}

    if (disabled) {
      return (
        <a
          ref={ref}
          className={classes('cursor-pointer', className)}
          aria-disabled
          tabIndex={-1}
          onClick={(event) => event.preventDefault()}
          {...other}
        >
          {children}
        </a>
      )
    }

    if (isBlank) {
      internalProps = { target: '_blank', rel: 'noreferrer' }
    }

    if (to) {
      return (
        <RRLink
          ref={ref}
          to={to}
          state={state}
          className={(status) =>
            classes(
              'cursor-pointer',
              className,
              activeClassName
                ? {
                    [activeClassName]: status.isActive,
                  }
                : undefined,
            )
          }
          {...internalProps}
          {...other}
          onClick={onClick}
          end={end}
        >
          {children}
        </RRLink>
      )
    }

    return (
      <a
        ref={ref}
        href={href}
        className={classes('cursor-pointer', className)}
        {...internalProps}
        {...other}
        onClick={onClick}
      >
        {children}
      </a>
    )
  },
)

RawLink.displayName = 'Link'
RawLink.defaultProps = {
  isBlank: false,
  activeClassName: 'active',
}

export default RawLink
