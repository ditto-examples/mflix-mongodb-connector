# Kid Movies — Android (Jetpack Compose)

Native Android port of the Ditto MongoDB Connector sample. Shows off the same
features as the SwiftUI/Flutter/React Native apps:

- **Movies** — live list of the kid-friendly (`rated G/PG`) movies synced by
  the Ditto sync subscription, full-text-ish search by title, add/edit movies,
  and per-movie comments (all syncing back through the MongoDB Connector).
- **System** — live `system:data_sync_info` sync session status (per-peer
  status dots, synced commit, last update) and `system:indexes` listing.
- **Tools** — the official Ditto diagnostic tools (peers list, presence
  viewer, data browser, disk usage, log viewer, health) via
  `ditto-tools-android`.

## Highlights

- **Ditto SDK for Android 5.1.0** (`com.ditto:ditto-kotlin`). Server
  connectivity via `DittoConfig(databaseId, Connect.Server(url))`, development
  token login through the auth expiration handler.
- **Material 3** with Ditto's *Anvil* design tokens (black-on-citrus brand
  color in light mode, citrus primary in dark mode; Inter + IBM Plex Mono).
  Follows the system dark/light setting.
- **Adaptive layouts**:
  - `NavigationSuiteScaffold` — bottom navigation bar on phones, navigation
    rail on tablets/foldables.
  - Navigation 3 `ListDetailSceneStrategy` — single-pane navigation on phones,
    list + detail side-by-side on tablets.
  - `LazyVerticalGrid` with `GridCells.Adaptive(300.dp)` for the movie grid.
  - Collapsing top app bar on scroll (enter-always behavior).

## Requirements

- Android Studio (latest stable) with SDK 37 & build-tools installed
- JDK 17
- An Android device or emulator running API 26+

## Setup

1. The credentials from the **root** `.env` file (see the repository root
   README) are read at build time by `app/build.gradle.kts` and injected into
   `BuildConfig`:

   ```dotenv
   DITTO_DATABASE_ID=...
   DITTO_DEVELOPMENT_TOKEN=...
   DITTO_SERVER_URL=https://...
   ```

   If any value is missing, the app starts with a configuration error screen
   instead of crashing.

2. Open the `android/` directory in Android Studio and run the `app` module,
   or from the command line:

   ```sh
   cd android
   ./gradlew :app:installDebug
   ```

## Notes

- `minSdk 26` because `ditto-tools-android` requires API 26 (the Ditto SDK
  itself supports API 24).
- The project pins its own Kotlin/Compose toolchain
  (`org.jetbrains.kotlin.android` 2.4.10) and therefore opts out of AGP 9's
  built-in Kotlin (`android.builtInKotlin=false`) so the latest Compose and
  AndroidX releases can be used.
- Bluetooth/Wi-Fi permissions for peer-to-peer transports are declared by the
  Ditto SDK via manifest merger and requested at runtime; sync with the Ditto
  Big Peer (server) works regardless.
- Release builds should enable minification with the rules in
  `app/proguard-rules.pro`.
