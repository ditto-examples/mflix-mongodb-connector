import { createContext } from 'react'

export type AlertContextProps = {
  /** Alerts parent node. */
  parentNodeId: string | null
}

/** Alerts context. */
const AlertContext = createContext<AlertContextProps>({
  /** The node ID where all alerts should be mounted into. */
  parentNodeId: null,
})

export default AlertContext
