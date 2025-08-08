# MFlix SwiftUI - Kid Movies App

A SwiftUI implementation of the MFlix movie browsing app demonstrating Ditto MongoDB Connector integration for offline-first, real-time data synchronization.

## Features

- Browse G-rated (kid-friendly) movies from MongoDB Atlas sample_mflix dataset
- View detailed movie information including plot, cast, ratings, and more
- Edit movie details with inline editing mode
- Add new movies to the collection
- Offline-first architecture with real-time sync via Ditto
- Peer-to-peer sync between devices

## Requirements

- iOS 16.0+ / macOS 13.0+
- Xcode 15.0+
- Swift 5.9+
- Ditto Portal account with configured app

## Setup

### 1. Configure Ditto Credentials

Open `Services/DittoService.swift` and update the following constants with your Ditto Portal credentials:

```swift
private let appId = "your-ditto-app-id"
private let token = "your-online-playground-token"
private let authUrl = "your-auth-url" // Optional
private let websocketUrl = "your-websocket-url" // Optional
```

You can find these values in the [Ditto Portal](https://portal.ditto.live) under your app's settings.

### 2. Install Dependencies

The project uses Swift Package Manager for dependency management. Ditto SDK will be automatically downloaded when you open the project in Xcode.

### 3. Build and Run

#### Using Xcode

1. Open the project in Xcode (create a new iOS app project and add these files)
2. Select your target device or simulator
3. Build and run (⌘R)

#### Using Swift Package Manager

```bash
cd swiftui
swift build
swift run
```

## Project Structure

```
swiftui/
├── MFlixApp.swift           # App entry point
├── Models/
│   └── Movie.swift          # Movie data model
├── Services/
│   └── DittoService.swift   # Ditto SDK integration and CRUD operations
├── Views/
│   ├── MoviesListView.swift # Main list view with movie cards
│   └── MovieDetailView.swift # Detailed movie view with edit mode
├── Info.plist               # App configuration and permissions
└── Package.swift            # SPM dependencies
```

## Architecture

### DittoService (Singleton)

The `DittoService` class manages:
- Ditto SDK initialization and lifecycle
- Real-time subscriptions to movie data
- CRUD operations using Ditto Query Language (DQL)
- Observable state for SwiftUI views

### Data Flow

1. **Initialization**: App starts → DittoService initializes → Connects to Ditto cloud
2. **Subscription**: DQL subscription for G-rated movies → Real-time updates
3. **Observation**: DQL observer monitors changes → Updates @Published properties
4. **UI Updates**: SwiftUI views observe DittoService → Automatic UI refresh

### Key Features Implementation

#### Movie List
- Uses `LazyVStack` for efficient scrolling
- `AsyncImage` for poster loading with placeholder
- Navigation to detail view via `NavigationLink`

#### Movie Detail
- Dual mode: read-only and edit
- Edit button in toolbar toggles edit mode
- Save validates and updates via DQL UPDATE query
- Real-time refresh after successful update

#### Add Movie
- Modal sheet presentation
- Form-based input with validation
- Creates new movie with DQL INSERT query

## Permissions

The app requires the following permissions for peer-to-peer sync:

- **Bluetooth**: For nearby device discovery and sync
- **Local Network**: For LAN-based device sync

These are configured in `Info.plist` with appropriate usage descriptions.

## DQL Queries Used

```sql
-- Subscribe to G-rated movies
SELECT * FROM movies WHERE rated = 'G'

-- Observe movies ordered by year
SELECT * FROM movies WHERE rated = 'G' ORDER BY year DESC

-- Get single movie
SELECT * FROM movies WHERE _id = 'movie-id'

-- Update movie
UPDATE movies SET title = 'New Title', year = '2024' WHERE _id = 'movie-id'

-- Insert new movie
INSERT INTO movies (columns...) VALUES (values...)

-- Delete movie
DELETE FROM movies WHERE _id = 'movie-id'
```

## Troubleshooting

### No Data Showing
- Verify Ditto credentials are correctly configured in `DittoService.swift`
- Check MongoDB Atlas cluster has sample_mflix dataset loaded
- Ensure MongoDB change streams are enabled
- Verify network connectivity

### Sync Issues
- Check Bluetooth and Local Network permissions are granted
- Ensure devices are on the same network for LAN sync
- Verify Ditto Portal app is properly configured

### Build Errors
- Clean build folder (⇧⌘K)
- Reset package caches: File → Packages → Reset Package Caches
- Ensure minimum iOS/macOS version requirements are met

## License

This project is part of the MFlix MongoDB Connector demonstration and follows the same Apache 2.0 license as the parent project.