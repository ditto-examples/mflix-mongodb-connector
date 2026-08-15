import {
  Children,
  cloneElement,
  ComponentProps,
  forwardRef,
  isValidElement,
  ReactNode,
  useImperativeHandle,
  useRef,
} from 'react'

import classes from '../utils/styles'

export type SvgAttributes = ComponentProps<'svg'> & {
  focusable?: 'true' | 'false'
}

type SvgOnlyProps = Omit<SvgAttributes, 'children'> & {
  /**
   * A single SVG icon element passed as a JSX tag.
   */
  svg: ReactNode
}

/**
 * Accepts a single SVG icon element and decorates it with a `shrink-0` class.
 * Merges classNames in this order of precedence (last wins):
 *   1. SvgOnly base classes (`shrink-0`)
 *   2. SvgOnly className
 *   3. svg className
 *
 * You probably want to use the `Icon` component instead.
 */
const SvgOnly = forwardRef<SVGSVGElement, SvgOnlyProps>(
  ({ className, style, svg, ...props }, ref) => {
    const innerRef = useRef<SVGSVGElement>(null)
    useImperativeHandle(ref, () => innerRef.current as SVGSVGElement)

    if (!isValidElement<SvgAttributes>(svg) || Children.count(svg) !== 1) {
      console.error('SvgOnly must be passed a single SVG icon as a JSX tag.')
      return null
    }

    return cloneElement(svg, {
      ...props,
      ...(ref ? { ref: innerRef } : {}),
      className: classes(
        'shrink-0', // SvgOnly base classes
        className, // SvgOnly className
        svg.props.className, // svg className (wins over SvgOnly className)
      ),
      style: { ...style, ...svg.props.style },
    } as SvgAttributes & { ref: typeof innerRef })
  },
)
SvgOnly.displayName = 'SvgOnly'

export { SvgOnly }
export type { SvgOnlyProps }
