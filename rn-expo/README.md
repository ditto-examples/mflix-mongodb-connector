# Welcome to the Ditto React Native Mflix Example App for the MongoDb Connector 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Prerequisites
- Basic understanding of Typscript, Expo, and React Native
- Xcode 15 or higher with Commnad Line Tools installed (Tested with XCode 16)
- Android SDK installed (v34 or higher) - (Tested with Android Studio Meerkat)
- IDE of choice (Visual Studio Code, Cursor, etc)

## Get started
To get started, you need to update the Ditto Service with your own Ditto App ID, Online Playground Token, Authentication URL, and Websocket URL.  You can find these in the Ditto Portal.  For documentation on how to do this, see the [Ditto Documentation](https://docs.ditto.live/cloud/portal/getting-sdk-connection-details).

Once you have this information, you can update the Ditto Service in the `src/services/dittoService.ts` file

```javascript
    /* 
     * UPDATE THESE VALUES WITH YOUR OWN VALUES FROM THE DITTO PORTAL
     * https://docs.ditto.live/cloud/portal/getting-sdk-connection-details
     */
    private appId = 'insert Ditto Portal App ID here';
    private token = 'insert Ditto Portal Online Playground Authentication Token here'; 
    private authURL = 'insert Ditto Portal Auth URL here';
    private websocketURL = 'insert Ditto Portal Websocket URL here';
```


Once you have updated the Ditto Service, you can start the app.

Because of how the current Ditto package works,  you will need to use Expo Development Builds:
- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

The basics steps are:

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

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Ditto documentation](https://docs.ditto.live/sdk/latest/install-guides/react-native)
- [Ditto Quickstart](https://docs.ditto.live/sdk/latest/quickstarts/react-native).
- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with Expo's [guides](https://docs.expo.dev/guides).
