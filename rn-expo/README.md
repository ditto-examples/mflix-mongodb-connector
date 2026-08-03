# Welcome to the Ditto React Native Mflix Example App for the MongoDb Connector 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Prerequisites
- Basic understanding of Typscript, Expo, and React Native
- Xcode 15 or higher with Commnad Line Tools installed (Tested with XCode 16)
- Android SDK installed (v34 or higher) - (Tested with Android Studio Meerkat)
- IDE of choice (Visual Studio Code, Cursor, etc)

## Get started
Create and fill in the root `.env` file as described in the
[repository setup](../README.md#ditto-development-credentials). You can find
these values in the [Ditto Portal](https://docs.ditto.live/cloud/portal/getting-sdk-connection-details).

The Expo configuration loads that root file when you start or build the app.

Because of how the current Ditto package works,  you will need to use Expo Development Builds:
- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

The basic steps are:

1. Install dependencies

```bash
npm install
```

2. Start the app

iOS:
```bash
npx expo run ios
```

Android:
```bash
npx expo run android
```

## Android platform notes

Two Android behaviors changed when this example moved to Expo SDK 54 / React Native 0.81. Both are visible in the generated `android/` project, so they are called out here rather than left as prebuild noise:

- **Edge-to-edge is always on.** Expo SDK 54 sets `expo.edgeToEdgeEnabled=true` and Android 16 (`targetSdkVersion 36`) no longer allows opting out. Screens draw behind the status and navigation bars, so any UI outside the navigator has to apply safe area insets itself - see `src/components/DittoErrorBanner.tsx`. The status bar background color and `translucent` props are ignored under edge-to-edge and are no longer set in `app/_layout.tsx`.
- **Predictive back is off.** `android.predictiveBackGestureEnabled` is set to `false` in `app.json`, which is what writes `android:enableOnBackInvokedCallback="false"` into the manifest. This is Expo's default because React Navigation does not fully support the predictive back gesture yet; the field is set explicitly so the manifest value is a deliberate choice rather than a prebuild artifact.

## Building Release Versions

### Build Commands

The following npm scripts are available for building release versions:

```bash
# Build Android release APK
npm run build:android

# Build iOS for simulator (default)
npm run build:ios

# Build iOS for physical device (requires valid signing)
npm run build:ios-device

# Build both platforms (Android + iOS simulator)
npm run build:release
```

### Output Locations
- **Android APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **iOS Simulator**: `ios/build/Release-iphonesimulator/mflixexpo.app`
- **iOS Device Archive**: `ios/build/mflixexpo.xcarchive` (when using `build:ios-device`)

## Installing Release Builds

### Android Installation

#### Using NPM Scripts (Recommended)
```bash
# Install on single connected device
npm run install:android

# Install on all connected Android devices
npm run install:android-all
```

#### Using ADB Directly
```bash
# List connected devices
adb devices

# Install on specific device
adb -s <device_id> install android/app/build/outputs/apk/release/app-release.apk

# Install on first available device
adb install android/app/build/outputs/apk/release/app-release.apk
```

#### Manual Installation
1. Transfer the APK file to your Android device
2. Enable "Unknown Sources" in Settings > Security
3. Tap the APK file to install

### iOS Installation

#### Using NPM Scripts (iOS Simulator)
```bash
# Install on currently booted iOS simulator
npm run install:ios-sim
```

#### Using Command Line (iOS Simulator)
```bash
# Install on iOS simulator
xcrun simctl install booted ios/build/Release-iphonesimulator/mflixexpo.app
```

#### Using Xcode
1. Open `ios/mflixexpo.xcworkspace` in Xcode
2. Select your target device
3. Build and run with Product > Run (⌘R)

#### For Physical iOS Devices
1. Open the `.xcarchive` file in Xcode
2. Use Xcode's Organizer to distribute to devices or App Store
3. Or use Xcode's "Devices and Simulators" window to install directly

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Ditto documentation](https://docs.ditto.live/sdk/latest/install-guides/react-native)
- [Ditto Quickstart](https://docs.ditto.live/sdk/latest/quickstarts/react-native).
- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with Expo's [guides](https://docs.expo.dev/guides).
