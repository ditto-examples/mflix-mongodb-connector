# Welcome to the Ditto Flutter Mflix Example App for the MongoDb Connector 👋

This is an [Flutter](https://flutter.dev/) project created with [Android Studio](https://docs.flutter.dev/tools/android-studio).

## Prerequisites
- Basic understanding of Dart and Flutter
- **Flutter 3.38.0 or newer** - `ios/Runner` uses the UIScene lifecycle that Flutter introduced in 3.38.0, so older versions fail to compile `AppDelegate.swift`. Tested with Flutter 3.47.0 and Dart 3.11.0
- Xcode 16 or higher with Command Line Tools installed (if you are using MacOS or iOS builds)
- Android SDK installed (v34 or higher)
- JDK 17 or newer for Android builds - the Android project uses Gradle 9.3.1 with AGP 8.13.0 and Kotlin 2.2.20, which runs on the JDK bundled with current Android Studio releases
- IDE of choice (Visual Studio Code, Android Studio "Koala" 2024.1.1 or higher, Cursor, etc)

## Get started
To get started, update `main.dart` with your Ditto Database ID, Online Playground Token, and URL. You can find these in the Ditto Portal. For documentation, see [Getting SDK Connection Details](https://docs.ditto.live/cloud/portal/getting-sdk-connection-details).

Once you have this information, you can update the Ditto Service in the `lib/main.dart` file

```dart
//
//Get these values from the Ditto Portal
//https://docs.ditto.live/cloud/portal/getting-sdk-connection-details
//https://docs.ditto.live/sdk/latest/install-guides/flutter
//
const _databaseId = 'insert Ditto Portal Database ID here';
const _token = 'insert Ditto Portal Online Playground Authentication Token here';
const _serverUrl = 'insert Ditto Portal Server URL here';
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
