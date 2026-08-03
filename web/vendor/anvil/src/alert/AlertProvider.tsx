import React from 'react'

import AlertContext from './context'

type Props = {
  children: React.ReactNode
}

const PARENT_NODE_ID = 'alertsParentNode'

/** Alerts provider shares the parent element ID for the alerts to be mounted into. */
const AlertProvider: React.FC<Props> = ({ children }: Props) => {
  return (
    <AlertContext.Provider value={{ parentNodeId: PARENT_NODE_ID }}>
      {children}
      <div className="fixed bottom-2 left-0 z-50 w-full">
        <div
          data-testid="alertProvider"
          className="container mx-auto sm:px-6 lg:px-8"
          id={PARENT_NODE_ID}
        />
      </div>
    </AlertContext.Provider>
  )
}

export default AlertProvider
