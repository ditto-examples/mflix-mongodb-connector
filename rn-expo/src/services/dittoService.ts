import {
	Ditto,
	IdentityOnlinePlayground,
	StoreObserver,
	SyncSubscription,
	TransportConfig,
  } from "@dittolive/ditto";

  import {
	PermissionsAndroid,
	Platform
  } from "react-native";

  export class DittoService {

    /* 
     * UPDATE THESE VALUES WITH YOUR OWN VALUES FROM THE DITTO PORTAL
     * https://docs.ditto.live/cloud/portal/getting-sdk-connection-details
     */
    private appId = 'insert Ditto Portal App ID here';
    private token = 'insert Ditto Portal Online Playground Authentication Token here'; 
    private authURL = 'insert Ditto Portal Auth URL here';
    private websocketURL = 'insert Ditto Portal Websocket URL here';

    private static instance: DittoService;
    private ditto: Ditto | null = null;
    public storeObserver: StoreObserver | undefined;
    public syncSubscription: SyncSubscription | undefined;
    private isInitializing = false;

    private constructor() {}

    /**
     * Creates and returns an identity configuration for Ditto's online playground environment.
     * This identity is used to authenticate and connect to the Ditto cloud service.
     * https://docs.ditto.live/sdk/latest/install-guides/react-native#onlineplayground
     * 
     * The identity includes:
     * - App ID and token for authentication
     * - Custom authentication URL for the MongoDB connector preview
     * - Cloud sync configuration
     * 
     * @returns {IdentityOnlinePlayground} An identity configuration object containing:
     * - type: 'onlinePlayground' - Specifies the identity type
     * - appID: string - The application identifier
     * - token: string - Authentication token
     * - customAuthURL: string - Custom authentication endpoint URL
     * - enableDittoCloudSync: boolean - Whether to enable cloud sync
     * 
     * @example
     * const identity = createIdentity();
     * // Returns:
     * // {
     * //   type: 'onlinePlayground',
     * //   appID: 'your-app-id',
     * //   token: 'your-playground-token',
     * //   customAuthURL: 'your-auth-url',
     * //   enableDittoCloudSync: false
     * // }
     */
    private createIdentity(): IdentityOnlinePlayground {
        return {
            type: 'onlinePlayground',
            appID: this.appId,
            token: this.token,
			customAuthURL: this.authURL,
			enableDittoCloudSync: false,
        };
    }

    /**
     * Creates and configures the transport settings for Ditto's peer-to-peer and cloud connectivity.
     * This function sets up the necessary transport configurations for different platforms and connection types.
     * 
     * The configuration includes:
     * - Bluetooth LE settings
     * - LAN settings with mDNS discovery
     * - AWDL settings (iOS only)
     * - WebSocket connection to Ditto cloud
     * 
     * @returns {TransportConfig} A transport configuration object.
     * 
     * @remarks
     * - On iOS, AWDL is enabled for better peer-to-peer connectivity
     * - mDNS is enabled for automatic device discovery on local networks
     * - WebSocket connection is configured for cloud sync
     * 
     * @example
     * const config = createTransportConfig();
     * // Returns a TransportConfig object with:
     * // {
     * //   peerToPeer: {
     * //     bluetoothLE: { isEnabled: true },
     * //     lan: { isEnabled: true, isMdnsEnabled: true },
     * //     awdl: { isEnabled: true } // iOS only
     * //   },
     * //   connect: {
     * //     websocketURLs: ['wss://your-ditto-cloud-url']
     * //   }
     * // }
     * 
     * @see https://docs.ditto.live/sdk/latest/install-guides/react-native#setting-transport-configurations
     */
    private createTransportConfig(): TransportConfig {
        // currently ReactNative doesn't support the enableAllPeerToPeer() method
        // so we need to enable each transport manually
        const config = new TransportConfig();
        config.peerToPeer.bluetoothLE.isEnabled = true;
        config.peerToPeer.lan.isEnabled = true;
        config.peerToPeer.lan.isMdnsEnabled = true;

        if (Platform.OS === 'ios') {
         config.peerToPeer.awdl.isEnabled = true;
        }
        
        config.connect.websocketURLs.push(this.websocketURL);
        return config;
    }

    /**
     * Requests the necessary permissions for Ditto's peer-to-peer functionality on Android devices.
     * This function handles the runtime permission requests required for Bluetooth and WiFi operations.
     * 
     * The permissions requested include:
     * - BLUETOOTH_CONNECT
     * - BLUETOOTH_ADVERTISE
     * - NEARBY_WIFI_DEVICES
     * - BLUETOOTH_SCAN
     * 
     * @returns {Promise<boolean>} A promise that resolves to:
     * - true if all permissions are granted
     * - false if any permission is denied
     * 
     * @remarks
     * - This function only runs on Android devices
     * - On iOS, it immediately returns true as permissions are handled differently
     * - All permissions must be granted for Ditto to function properly
     * 
     * @see https://docs.ditto.live/sdk/latest/install-guides/react-native#handling-permissions
     */
    private async requestPermissions(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return true;
        }
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        ];
      
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        return Object.values(granted).every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED
        );
    }

    /**
     * Initializes the Ditto service with the required configuration and permissions.
     * This function sets up the Ditto instance with identity, transport configuration, and starts sync.
     * 
     * The initialization process includes:
     * 1. Requesting necessary permissions (Android only)
     * 2. Creating identity configuration
     * 3. Setting up transport configuration
     * 4. Starting Ditto sync
     * 
     * @returns {Promise<void>} A promise that resolves when initialization is complete
     * 
     * @throws {Error} Throws an error if:
     * - Required permissions are not granted
     * - Ditto initialization fails
     * 
     * @remarks
     * - This function is idempotent - calling it multiple times will not reinitialize
     * - Initialization is tracked to prevent concurrent initialization attempts
     * - The function handles platform-specific requirements automatically
     * 
     * @see https://docs.ditto.live/sdk/latest/install-guides/react-native
     */
    public async initDitto(): Promise<void> {
        if (this.ditto) {
            console.log('Ditto already initialized');
            return;
        }

        if (this.isInitializing) {
            console.log('Ditto initialization already in progress');
            return;
        }

        this.isInitializing = true;

        let isPermissionsGranted = await this.requestPermissions();
        if (!isPermissionsGranted) {
            throw "Permissions Not Granted";
        }

        try {
            const identity = this.createIdentity();
            const transportConfig = this.createTransportConfig();

            this.ditto = new Ditto(identity);
            this.ditto.setTransportConfig(transportConfig);
            this.ditto.startSync();
            
        } catch (error) {
            this.ditto = null;
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    public static getInstance(): DittoService {
        if (!DittoService.instance) {
            DittoService.instance = new DittoService();
        }
        return DittoService.instance;
    }

    public getDitto(): Ditto {
        if (!this.ditto) {
            throw new Error('Ditto not initialized. Call initDitto() first.');
        }
        return this.ditto;
    }

  }