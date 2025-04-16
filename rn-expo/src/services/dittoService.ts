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
	private websocketURL: string = 'insert Ditto Portal Websocket URL here';
	private identity: IdentityOnlinePlayground = {
		type: 'onlinePlayground',
		appID: 'insert Ditto Portal App ID here', 
		token: 'insert Ditto Portal Online Playground Authenticaton Token here',
		customAuthURL: 'insert Ditto Portal Auth URL here',
		enableDittoCloudSync: false,
	  };

    private ditto: Ditto | undefined;
    public storeObserver: StoreObserver | undefined;
    public syncSubscription: SyncSubscription | undefined;

	public async initDitto() {

		//request permissions
		let result = await this.requestPermissions();
		if (!result) {
			throw new Error('Permissions not granted');
		}
		// https://docs.ditto.live/sdk/latest/install-guides/react-native#onlineplayground
		this.ditto = new Ditto(this.identity);
		//
		const transportsConfig = new TransportConfig();
        transportsConfig.setAllPeerToPeerEnabled(true);
        transportsConfig.connect.websocketURLs.push(this.websocketURL);
        this.ditto.setTransportConfig(transportsConfig);

		//start sync
		this.ditto.startSync();
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