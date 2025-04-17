# Welcome to the Ditto Flutter Mflix Example App for the MongoDb Connector 👋

This is an [Flutter](https://flutter.dev/) project created with [Android Studio](https://docs.flutter.dev/tools/android-studio).

## Prerequisites
- Basic understanding of Dart and Flutter
- Tested with Flutter 3.27.4 and Dart 3.6.2
- Xcode 16 or higher with Commnad Line Tools installed
- Android SDK installed (v34 or higher)
- IDE of choice (Visual Studio Code, Android Studio "Koala" 2024.1.1 or higher, Cursor, etc)

## Get started
To get started, you need to update the main.dart file with your own Ditto App ID, Online Playground Token, Authentication URL, and Websocket URL.  You can find these in the Ditto Portal.  For documentation on how to do this, see the [Ditto Documentation](https://docs.ditto.live/cloud/portal/getting-sdk-connection-details).

Once you have this information, you can update the Ditto Service in the `lib/main.dart` file

```dart
//
//Get these values from the Ditto Portal
//https://docs.ditto.live/cloud/portal/getting-sdk-connection-details
//https://docs.ditto.live/sdk/latest/install-guides/flutter
//
const _appId = 'insert Ditto Portal App ID here';
const _token = 'insert Ditto Portal Online Playground Authentication Token here';
const _authUrl = 'insert Ditto Portal Auth URL here';
const _websocketUrl = 'insert Ditto Portal Websocket URL here';
```

Once you have updated the Ditto Service, you can start the app by following the instructions below:

1. Install dependencies

   ```bash
   flutter pub get 
   ```

2. Start the app

```bash
flutter run
```

## Learn more
To learn more about developing your project with Flutter, look at the following resources:

- [Ditto documentation](https://docs.ditto.live/sdk/latest/install-guides/flutter)
- [Ditto Quickstart](https://docs.ditto.live/sdk/latest/quickstarts/flutter).
- [Flutter documentation](https://docs.flutter.dev/): Learn fundamentals, or go into advanced topics with Flutter's [learning resources](https://docs.flutter.dev/reference/learning-resources).
