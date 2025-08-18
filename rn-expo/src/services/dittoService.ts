import {
	Ditto,
	IdentityOnlinePlayground,
	StoreObserver,
	SyncSubscription,
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
    private appId = 'a48453d8-c2c3-495b-9f36-80189bf5e135';
    private token = '8304ca7f-e843-47ed-a0d8-32cc5ff1be7e'; 
    private authURL = 'https://m1tpgv.cloud.dittolive.app';
    private websocketURL = 'wss://m1tpgv.cloud.dittolive.app';

    private static instance: DittoService;
    public ditto: Ditto | null = null;

    public movieObserver: StoreObserver | undefined;
    public movieSubscription: SyncSubscription | undefined;

    public commentsSubscription: SyncSubscription | undefined;
    public commentsObserver: StoreObserver | undefined;

    public syncStatusObserver: StoreObserver | undefined;

    private isInitializing = false;

    private constructor() {}

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
            this.ditto = new Ditto(this.createIdentity()); 

            //https://docs.ditto.live/sdk/latest/install-guides/react-native#setting-transport-configurations
            this.ditto.updateTransportConfig((config) => {
                config.peerToPeer.bluetoothLE.isEnabled = true;
                config.peerToPeer.lan.isEnabled = true;
                config.peerToPeer.lan.isMdnsEnabled = true;

                if (Platform.OS === 'ios') {
                    config.peerToPeer.awdl.isEnabled = true;
                } else {
                    config.peerToPeer.awdl.isEnabled = false;
                }
                config.connect.websocketURLs.push(this.websocketURL);
            });

            //Disable sync with v3 peers, required for DQL
            this.ditto.disableSyncWithV3();

            // Disable DQL strict mode so that collection definitions are not required in DQL queries
            // https://docs.ditto.live/dql/strict-mode#introduction
            await this.ditto.store.execute("ALTER SYSTEM SET DQL_STRICT_MODE = false");

            // Register a subscription to the movies collection to only return kid movies
            // https://docs.ditto.live/sdk/latest/sync/syncing-data#subscriptions
            this.movieSubscription = this.ditto.sync.registerSubscription("SELECT * FROM movies WHERE rated = 'G' OR rated = 'PG'");

            // Register a subscription to the comments collection
            // https://docs.ditto.live/sdk/latest/sync/syncing-data#subscriptions
            this.commentsSubscription = this.ditto.sync.registerSubscription("SELECT * FROM comments");

            // CREATE index on title and year field if it doesn't already exist
            // https://docs.ditto.live/dql/dql
            await this.ditto.store.execute("CREATE INDEX IF NOT EXISTS movies_title_idx ON movies(title)");
            await this.ditto.store.execute("CREATE INDEX IF NOT EXISTS movies_year_idx ON movies(year)");

            // https://docs.ditto.live/sdk/latest/sync/syncing-data#start-sync
            this.ditto.sync.start();
            
        } catch (error) {
            console.log(error);
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