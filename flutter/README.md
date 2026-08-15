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
Create and fill in the root `.env` file as described in the
[repository setup](../README.md#ditto-development-credentials). You can find
these values in the [Ditto Portal](https://docs.ditto.live/cloud/portal/getting-sdk-connection-details).

Then start the app:

1. Install dependencies

   ```bash
   flutter pub get 
   ```

2. Start the app

```bash
flutter run --dart-define-from-file=../.env
```

Pass the same flag to release builds, otherwise the app starts with no
configuration and shows the "Could not start Ditto" screen:

```bash
flutter build apk --dart-define-from-file=../.env
flutter build ios --dart-define-from-file=../.env
```

If you launch from an IDE, add the flag to your run configuration
(`"args": ["--dart-define-from-file=../.env"]` in VS Code's `launch.json`).

## Learn more
To learn more about developing your project with Flutter, look at the following resources:

- [Ditto documentation](https://docs.ditto.live/sdk/latest/install-guides/flutter)
- [Ditto Quickstart](https://docs.ditto.live/sdk/latest/quickstarts/flutter).
- [Flutter documentation](https://docs.flutter.dev/): Learn fundamentals, or go into advanced topics with Flutter's [learning resources](https://docs.flutter.dev/reference/learning-resources).
