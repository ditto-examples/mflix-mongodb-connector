import cx from 'classnames'
import React, { forwardRef } from 'react'

import RawLink from './RawLink'
import { RawLinkProps } from './RawLink'

const Link = forwardRef<HTMLAnchorElement, RawLinkProps>(
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
      ...other
    },
    ref,
  ) => (
    <RawLink
      ref={ref}
      to={to}
      href={href}
      state={state}
      className={cx('hover:opacity-80', className)}
      activeClassName={activeClassName}
      isBlank={isBlank}
      {...other}
      end={end}
    >
      {children}
    </RawLink>
  ),
)

Link.displayName = 'Link'
Link.defaultProps = {
  isBlank: false,
  activeClassName: 'active',
}

export default Link
