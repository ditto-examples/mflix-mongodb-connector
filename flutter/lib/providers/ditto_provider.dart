import 'package:flutter/foundation.dart';

import 'package:ditto_live/ditto_live.dart';
import 'package:permission_handler/permission_handler.dart';

class DittoProvider with ChangeNotifier {
  Ditto? _ditto;

  /// The Ditto instance used for database operations
  Ditto? get ditto => _ditto;

  /// Initializes the Ditto instance with necessary permissions and configuration.
  /// https://docs.ditto.live/sdk/latest/install-guides/flutter#step-3-import-and-initialize-the-ditto-sdk
  ///
  /// This function:
  /// 1. Requests required Bluetooth and WiFi permissions on non-web platforms
  /// 2. Initializes the Ditto SDK
  /// 3. Sets up online playground identity with the provided app ID and token
  /// 4. Enables peer-to-peer communication on non-web platforms
  /// 5. Configures WebSocket connection to Ditto cloud
  /// 6. Starts sync and updates the app state with the configured Ditto instance
  Future<void> initialize(
      String appId, String token, String authUrl, String websocketUrl) async {
    //request permissions - required if you aren't in web to use P2P
    if (!kIsWeb) {
      await [
        Permission.bluetoothConnect,
        Permission.bluetoothAdvertise,
        Permission.nearbyWifiDevices,
        Permission.bluetoothScan
      ].request();
    }
    // Initialize Ditto first
    await Ditto.init();

    final identity = OnlinePlaygroundIdentity(
        appID: appId,
        token: token,
        customAuthUrl: authUrl,
        enableDittoCloudSync: false);
    _ditto = await Ditto.open(identity: identity);

    _ditto?.updateTransportConfig((config) {
      // Note: this will not enable peer-to-peer sync on the web platform
      config.setAllPeerToPeerEnabled(true);
      config.connect.webSocketUrls.add(websocketUrl);
    });
    _ditto?.startSync();
  }
}
