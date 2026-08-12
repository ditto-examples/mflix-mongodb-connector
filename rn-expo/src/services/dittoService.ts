import {
	Authenticator,
	Ditto,
	DittoConfig,
	StoreObserver,
	SyncSubscription,
  } from "@dittolive/ditto";

import {
	PermissionsAndroid,
	Platform
  } from "react-native";

import Constants from "expo-constants";

type DittoEnvironment = {
  databaseID?: string;
  developmentToken?: string;
  serverURL?: string;
};

const dittoEnvironment = Constants.expoConfig?.extra?.ditto as
  | DittoEnvironment
  | undefined;

function requiredDittoValue(
  key: keyof DittoEnvironment,
  environmentName: string
): string {
  const value = dittoEnvironment?.[key];
  if (!value) {
    throw new Error(
      `Missing ${environmentName}. Copy .env.template to .env at the repository root and set the Ditto development credentials.`
    );
  }
  return value;
}

  export class DittoService {

    private databaseId = requiredDittoValue('databaseID', 'DITTO_DATABASE_ID');
    private token = requiredDittoValue(
      'developmentToken',
      'DITTO_DEVELOPMENT_TOKEN'
    );
    private serverURL = requiredDittoValue('serverURL', 'DITTO_SERVER_URL');

    private static instance: DittoService;
    public ditto: Ditto | null = null;

    public movieObserver: StoreObserver | undefined;
    public movieSubscription: SyncSubscription | undefined;

    public commentsSubscription: SyncSubscription | undefined;
    public commentsObserver: StoreObserver | undefined;

    public syncStatusObserver: StoreObserver | undefined;

    /**
     * The most recent authentication failure, if any. Authentication runs in the
     * background whenever the token needs refreshing, so failures cannot be
     * thrown back to `initDitto`'s caller - they land here instead.
     */
    public authError: Error | null = null;

    /** Called whenever {@link authError} changes. */
    public onAuthError: ((error: Error) => void) | undefined;

    private isInitializing = false;

    private constructor() {}

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
     * This function configures the Ditto instance, authenticates, and starts sync.
     * 
     * The initialization process includes:
     * 1. Requesting necessary permissions (Android only)
     * 2. Creating the database and server configuration
     * 3. Setting up authentication
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
            const config = new DittoConfig(this.databaseId, {
                mode: 'server',
                url: this.serverURL,
            });
            this.ditto = await Ditto.open(config);

            // The expiration handler is how a server connection authenticates: it
            // runs once at startup and again whenever the token nears expiration.
            // https://docs.ditto.live/sdk/latest/auth-and-authorization/cloud-authentication
            //
            // It runs in the background, so a failure here cannot be thrown back to
            // the caller of initDitto - it is reported through onAuthError so the UI
            // can tell the user why sync is not working.
            await this.ditto.auth.setExpirationHandler(async (ditto, timeUntilExpiration) => {
                try {
                    const result = await ditto.auth.login(
                        this.token,
                        Authenticator.DEVELOPMENT_PROVIDER,
                    );
                    if (result.error) {
                        this.reportAuthError(
                            new Error(
                                `Ditto authentication failed with ${timeUntilExpiration} seconds remaining: ${result.error}`,
                            ),
                        );
                    }
                } catch (e) {
                    this.reportAuthError(
                        e instanceof Error ? e : new Error(`Ditto authentication failed: ${e}`),
                    );
                }
            });

            // Register a subscription to the movies collection to only return kid movies
            // https://docs.ditto.live/sdk/latest/sync/syncing-data#subscriptions
            this.movieSubscription = this.ditto.sync.registerSubscription("SELECT * FROM movies WHERE rated = 'G' OR rated = 'PG'");

            // Register a subscription to the comments collection
            // https://docs.ditto.live/sdk/latest/sync/syncing-data#subscriptions
            this.commentsSubscription = this.ditto.sync.registerSubscription("SELECT * FROM comments");

            // CREATE index on title and year field if it doesn't already exist
            // https://docs.ditto.live/dql/dql
            await this.ditto.store.execute("CREATE INDEX IF NOT EXISTS comments_movie_id_idx ON comments(movie_id)");
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

    private reportAuthError(error: Error): void {
        this.authError = error;
        console.error(error.message);
        this.onAuthError?.(error);
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
