import React, { forwardRef, ReactNode } from 'react'

import classes from '../utils/styles'
import { SvgAttributes, SvgOnly } from './SvgOnly'

type IconProps = Omit<SvgAttributes, 'children' | 'ref'> & {
  /**
   * A single SVG icon element passed as a JSX tag.
   */
  svg: ReactNode
}

/**
 * Decorates an svg icon with automatic sizing styles (`size-5`) and a `shrink-0` class.
 *
 * Merges classNames in this order of precedence (last wins):
 *   1. SvgOnly base classes (`shrink-0`)
 *   2. Icon base classes (`size-5`)
 *   3. Icon className
 *   4. svg className
 *
 * @example
 * ```tsx
 * import { Icon } from '@dittolive/anvil'
 * import { Fire } from '@phosphor-icons/react'
 *
 * <Icon svg={<Fire />} />
 * <Icon className="text-fill-critical" svg={<Fire weight="fill" />} />
 * ```
 */
const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, style, svg, ...props }, ref) => (
    <SvgOnly
      ref={ref}
      className={classes('size-5', className)}
      style={style}
      svg={svg}
      {...(props as Omit<
        SvgAttributes,
        'children' | 'className' | 'style' | 'ref'
      >)}
    />
  ),
)
Icon.displayName = 'Icon'

export { Icon }
export type { IconProps }
