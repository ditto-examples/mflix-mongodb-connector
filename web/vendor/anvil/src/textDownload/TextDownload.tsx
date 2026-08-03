import React from 'react'

import { Link } from '../link'
import { RawLinkProps } from '../link/RawLink'

type Props = {
  /** File name, including the extension. */
  fileName: string
}

/** Component used to provide an href value as a downloadable file link on the browser */
const TextDownload: React.FC<Props & RawLinkProps> = ({
  href,
  fileName,
  children,
  ...other
}) => {
  return (
    <Link isBlank href={href} download={fileName} {...other}>
      {children}
    </Link>
  )
}

export default TextDownload
