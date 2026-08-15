# Welcome to the Ditto SwiftUI Mflix Example App for the MongoDb Connector 👋

This is an [SwiftUI](https://developer.apple.com/documentation/swiftui) project created with [XCode 16](https://developer.apple.com/documentation/xcode).

## Prerequisites
- Basic understanding of Swift and SwiftUI 
- Tested with XCode 16.4 on iOS 18 and iOS 26 
- Xcode 16.4 or higher with Command Line Tools installed

## Get started
Create and fill in the root `.env` file as described in the
[repository setup](../README.md#ditto-development-credentials). You can find
these values in the [Ditto Portal](https://docs.ditto.live/cloud/portal/getting-sdk-connection-details).

The Xcode project generates `Generated/Env.swift` from the root file before
compiling, so the credentials never enter version control. Only the three
`DITTO_*` keys are read; anything else in the `.env` stays out of the app.
Once the root file is configured, open the project and run the app in Xcode.

## Learn more
To learn more about developing your project with SwiftUI, look at the following resources:

- [Ditto documentation](https://docs.ditto.live/sdk/latest/install-guides/swift)
- [Ditto Quickstart](https://docs.ditto.live/sdk/latest/quickstarts/swift).
- [SwiftUI documentation](https://developer.apple.com/documentation/swiftui)
