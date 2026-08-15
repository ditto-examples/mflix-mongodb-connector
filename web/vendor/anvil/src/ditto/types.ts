export type DittoIdentityType =
  | 'offlinePlayground'
  | 'online'
  | 'manual'
  | 'onlinePlayground'

export type DittoConnectionValues = {
  appName: string
  type: DittoIdentityType
  offlineOnlyLicenseToken?: string
  onlinePlaygroundToken?: string
  wsUrl?: string
  tcpUrl?: string
  siteId?: string
  certificate?: string
  path?: string
  tcpListenerUrl?: string
  authenticationUrl?: string
}
