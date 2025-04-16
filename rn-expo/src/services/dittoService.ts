import {
	Ditto,
	IdentityOnlinePlayground,
	StoreObserver,
	SyncSubscription,
	TransportConfig,
	Logger
  } from "@dittolive/ditto";

  import {
	PermissionsAndroid,
	Platform
  } from "react-native";

  export class DittoService {
    private static instance: DittoService;
    private ditto: Ditto | undefined;
    public storeObserver: StoreObserver | undefined;
    public syncSubscription: SyncSubscription | undefined;
    private _isInitialized: boolean = false;

    private constructor() {}

    public static getInstance(): DittoService {
        if (!DittoService.instance) {
            DittoService.instance = new DittoService();
        }
        return DittoService.instance;
    }

    public get isInitialized(): boolean {
        return this._isInitialized;
    }

    public get dittoInstance(): Ditto | undefined {
        return this.ditto;
    }

	public async initDitto() {
        if (this._isInitialized) {
            return;
        }

		//setup logger
		Logger.minimumLogLevel = 'Debug';

		// First request permissions
		let result = await this.requestPermissions();
		if (!result) {
			throw new Error('Permissions not granted');
		}

		// Setup identity
		const identity: IdentityOnlinePlayground = {
			type: 'onlinePlayground',
			appID: 'insert Ditto Portal App ID here', 
			token: 'insert Ditto Portal Online Playground Authenticaton Token here',
			customAuthURL: 'insert Ditto Portal Auth URL here',
			enableDittoCloudSync: false,
		};
		const websocketURL: string = 'insert Ditto Portal Websocket URL here';

		try {
			// Create Ditto instance
			this.ditto = new Ditto(identity);

			// Configure transports
			const config = new TransportConfig();
			config.setAllPeerToPeerEnabled(true);
			// Add websocket URL
			config.connect.websocketURLs.push(websocketURL);

			// Set transport config
			this.ditto.setTransportConfig(config);

			// Start sync
			this.ditto.startSync();
			this._isInitialized = true;
			console.log('Ditto initialized');
		} catch (error) {
			console.error('Error initializing Ditto:', error);
			throw error;
		}
	}
    
    private async requestPermissions(): Promise<boolean> {
		//only request permissions on android
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
  }