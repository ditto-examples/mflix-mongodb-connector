# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo demonstrating Ditto MongoDB Connector integration with sample movie applications in Flutter and React Native (Expo). The apps provide offline-first, real-time syncing movie browsing experiences using MongoDB Atlas's sample_mflix dataset.

## Repository Structure

```
/
├── flutter/        # Flutter implementation (Dart)
├── rn-expo/        # React Native with Expo (TypeScript)
└── scripts/        # MongoDB utility scripts
```

## Common Development Commands

### Flutter App
```bash
cd flutter
flutter pub get          # Install dependencies
flutter run              # Run app on connected device/simulator
flutter test             # Run tests
flutter build apk        # Build Android APK
flutter build ios        # Build iOS app
```

### React Native Expo App
```bash
cd rn-expo
npm install              # Install dependencies
npx expo run ios         # Run on iOS simulator
npx expo run android     # Run on Android emulator
npm test                 # Run Jest tests
npm run lint             # Run ESLint
npm run clean            # Clean build artifacts
```

## Architecture & Key Components

### Flutter App
- **State Management:** Provider pattern with `DittoProvider` at `lib/providers/ditto_provider.dart`
- **Ditto Service:** Singleton pattern in `DittoProvider` manages Ditto SDK lifecycle
- **Data Flow:** Ditto → Provider → UI Components
- **Key Integration Point:** `lib/providers/ditto_provider.dart` - Configure App ID and auth token here

### React Native App
- **State Management:** React Context with custom hooks
- **Ditto Service:** Singleton at `src/services/dittoService.ts`
- **Data Flow:** Ditto → Context Provider → Hooks → Components
- **Key Integration Point:** `src/services/dittoService.ts` - Configure App ID and auth token here

### Shared Concepts
- **Data Model:** Movies with fields: _id, title, plot, poster, rated, year, cast, etc.
- **Query Pattern:** DQL queries filter for G-rated movies: `SELECT * FROM movies WHERE rated = 'G'`
- **Collection:** Both apps use `movies` collection in Ditto
- **Sync:** Real-time sync between MongoDB Atlas and local Ditto database

## Critical Configuration Points

When setting up Ditto integration:
1. **Flutter:** Update `lib/providers/ditto_provider.dart` with your Ditto App ID and token
2. **React Native:** Update `src/services/dittoService.ts` with your Ditto App ID and token
3. **Transport Config:** Both apps configure transport settings to handle Android AWDL issues

## Testing Approach

### Flutter
- Unit tests in `test/` directory
- Run single test: `flutter test test/specific_test.dart`
- Widget tests for UI components

### React Native
- Jest tests alongside source files (`*.test.ts`)
- Run single test: `npm test -- specific_test`
- Component testing with React Native Testing Library

## Common Issues & Solutions

1. **Android Crashes:** Related to AWDL transport - already fixed in recent commits by disabling AWDL on Android
2. **Ditto Connection:** Ensure App ID and tokens are correctly configured in service files
3. **MongoDB Sync:** Verify change streams are enabled in MongoDB Atlas cluster
4. **iOS Permissions:** Both apps handle Bluetooth/Network permissions for peer-to-peer sync

## Development Workflow

1. Choose platform directory (`flutter/` or `rn-expo/`)
2. Install dependencies
3. Configure Ditto credentials in appropriate service file
4. Run app on simulator/device
5. Verify MongoDB → Ditto sync is working
6. Run tests before committing changes