import React, { ComponentProps, forwardRef } from 'react'

type Props = ComponentProps<'svg'>
const Logo = forwardRef<SVGSVGElement, Props>((props, ref) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="21"
    height="24"
    fill="currentColor"
    viewBox="0 0 21 24"
    ref={ref}
    {...props}
  >
    <path d="m9.464 0 .296.296v2.815l.296.296h4.733l.296.296v4.593l.295.297h5.324l.296.296v6.222l-.296.296H15.38l-.295.296v4.593l-.296.296h-4.733l-.296.297v2.815L9.464 24H6.211l-.296-.296v-3.408L6.211 20h3.55l.295-.296V15.11l.296-.297h5.028l.296-.296V9.481l-.296-.296h-5.028l-.296-.296V4.296L9.76 4H6.211l-.296-.297V.296L6.211 0zM3.402 16.148v2.815l-.296.296H.296L0 18.963v-2.815l.296-.296h2.81z" />
    <path d="M9.168 9.63v4.74l-.296.297H4.14l-.296-.296V9.63l.296-.297h4.732zM3.402 5.037v2.815l-.296.296H.296L0 7.852V5.037l.296-.296h2.81z" />
  </svg>
))

Logo.displayName = 'Logo'

export default Logo
