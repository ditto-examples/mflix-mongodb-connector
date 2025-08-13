# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Flutter movie database application (mflix_app) that demonstrates Ditto Live integration for real-time data synchronization. The app displays G and PG-rated movies with offline-first capability and P2P sync.

## Essential Commands

### Development
```bash
# Install dependencies
flutter pub get

# Run the application
flutter run

# Run on specific device/platform
flutter run -d chrome  # Web
flutter run -d ios     # iOS simulator
flutter run -d android # Android emulator
```

### Testing & Quality
```bash
# Run tests
flutter test

# Run specific test file
flutter test test/widget_test.dart

# Static analysis
flutter analyze

# Check for outdated dependencies
flutter pub outdated
```

### Build
```bash
# Android APK
flutter build apk --release

# iOS (requires macOS)
flutter build ios --release

# Web
flutter build web --release
```

## Architecture & Code Structure

### Core Architecture Pattern
The app uses a **centralized observer pattern** with app-lifecycle managed streams for optimal performance:

1. **DittoProvider** (lib/providers/ditto_provider.dart) - Manages the Ditto SDK instance, observers, and cached streams
2. **App-Lifecycle Observers** - Created once during initialization and persist until app closure:
   - `_moviesObserver` - Global movies observer with cached results
   - `_commentsObserver` - Global comments observer with cached results  
   - `_syncStatusObserver` - Global sync status observer with cached results
3. **Cached Stream Architecture** - Streams provide immediate cached data plus live updates
4. **Data Flow**: Ditto SDK → App-Lifecycle Observers → Cached Streams → UI Components

### Key Components
- **lib/main.dart**: Entry point with PageView-based tab navigation and scroll position preservation
- **lib/providers/ditto_provider.dart**: Centralized data management with cached streams and app-lifecycle observers
- **lib/models/movie.dart**: Full movie data model for detailed views
- **lib/models/movie_listing.dart**: Lightweight movie model with projected fields for listings
- **lib/models/comment.dart**: Comment data model with MongoDB ObjectId parsing
- **lib/models/index.dart**: Index data model for database index information
- **lib/models/sync_status.dart**: Sync status model for peer connection information
- **lib/screens/**: UI screens with state preservation (MoviesScreen, SettingsScreen, IndexesScreen, SyncStatusView, MovieDetailScreen)
- **lib/widgets/**: Reusable reactive components for Ditto integration and comments display

### System Features
The app includes a System tab with two main views accessed via segmented buttons:

1. **Sync Status View** - Displays real-time peer connection information
2. **Indexes View** - Shows local database indexes using `SELECT * FROM system:indexes`

### Movie Detail Features
Movie detail screens include segmented controls with two main views:

1. **Details View** - Shows complete movie information with editing capabilities
2. **Comments View** - Displays and manages user comments with real-time count updates

### State Management
Uses a **centralized stream-based architecture** with state preservation:
- **DittoProvider** for SDK instance management and global data streams
- **App-Lifecycle Observers** for reactive data updates (created once, persist until app closure)
- **Cached Streams** for immediate data access and real-time updates
- **AutomaticKeepAliveClientMixin** for preserving widget state across tab switches
- **PageView + PageStorageKey** for maintaining scroll positions
- **StreamSubscription** for controlled data listening in individual screens

## Critical Configuration

Before running, update these constants in `lib/main.dart` with values from Ditto Portal:
```dart
const _appId = 'insert Ditto Portal App ID here';
const _token = 'insert Ditto Portal Online Playground Authentication Token here';
const _authUrl = 'insert Ditto Portal Auth URL here';
const _websocketUrl = 'insert Ditto Portal Websocket URL here';
```

## Key Dependencies
- **ditto_live**: ^4.12.0-preview.3 - Core real-time sync SDK
- **provider**: ^6.1.5 - Dependency injection
- **cached_network_image**: ^3.3.0 - Image caching
- **permission_handler**: ^12.0.0+1 - Runtime permissions for P2P

## Ditto-Specific Patterns

### DQL Queries
The app uses Ditto Query Language (DQL) for data operations with memory-efficient projections:

```dart
// Movies - Sync subscription for offline access
'SELECT * FROM movies WHERE rated = \'G\' OR rated = \'PG\''

// Movies - Observation query with projections for UI performance
'SELECT _id, plot, poster, title, year, imdb.rating AS imdbRating, tomatoes.viewer.rating as rottenRating FROM movies WHERE rated = \'G\' OR rated = \'PG\' ORDER BY year DESC'

// Movies - Individual document fetch for full details
'SELECT * FROM movies WHERE _id = :id'

// Comments - Global subscription for app lifecycle (set in DittoProvider)
'SELECT * FROM comments'

// Comments - Movie-specific observation query
'SELECT * FROM comments WHERE movie_id = :movieId ORDER BY date DESC'

```

### Stream-Based Architecture
The app uses a **centralized stream pattern** instead of per-widget observers:

1. **DittoProvider Streams**: Access cached streams from the provider
   ```dart
   // Movies screen uses provider stream
   StreamBuilder(stream: widget.dittoProvider.moviesStream, ...)
   
   // Sync status uses provider stream  
   StreamBuilder(stream: dittoProvider.syncStatusStream, ...)
   
   // Comments use filtered provider stream
   widget.dittoProvider.getCommentsForMovie(movieId).listen(...)
   ```

2. **Immediate Cache Access**: Streams yield cached data immediately, then live updates
3. **No Widget Observers**: Avoid creating observers in individual widgets to prevent lifecycle issues

### DQL Projections for Performance
The app uses a dual-model approach for memory efficiency:

1. **MovieListing Model** - Used for list views with projected fields only:
   ```dart
   // Projects only essential fields needed for display
   'SELECT _id, plot, poster, title, year, imdb.rating AS imdbRating, tomatoes.viewer.rating as rottenRating FROM movies...'
   ```

2. **Movie Model** - Used for detail views with full document data:
   ```dart
   // Fetches complete document when detailed information is needed
   'SELECT * FROM movies WHERE _id = :id'
   ```

This pattern reduces memory usage in list views while maintaining full data access when needed.

### Comments System Architecture
The app implements a comprehensive comments system with the following features:

1. **Global Observer**: Comments are observed globally via DittoProvider for app lifecycle
2. **Filtered Streams**: Movie-specific comments are filtered from the global stream
3. **Cached Data**: Comments are cached at provider level for instant access
4. **Segmented Interface**: Movie detail screens use segmented controls to switch between Details and Comments
5. **Efficient Counting**: Comment count is calculated from filtered results length (no separate COUNT query)
6. **Anonymous Comments**: Users can add comments as "Anonymous" without authentication
7. **MongoDB Compatibility**: Handles MongoDB ObjectId format for seamless data interchange
8. **Stream Subscription**: Uses StreamSubscription for controlled lifecycle management

#### Comment Data Structure
```dart
{
  "_id": "comment_id",
  "name": "Anonymous", 
  "email": "anonymous@example.com",
  "movie_id": "movie_object_id",
  "text": "Comment text content",
  "date": 1332804016000 // Unix timestamp in milliseconds
}
```

#### UI Behavior
- **Details View**: Shows edit button in app bar, allows movie editing
- **Comments View**: Shows add button (FAB), allows comment creation
- **Automatic Transitions**: Switching to comments automatically exits movie edit mode
- **Fast Switching**: Segment switching is instant with cached data (no rebuilds)
- **Scroll Preservation**: Maintains scroll position when switching between segments

#### Performance Optimizations
- **Global Observer**: Single observer for all comments reduces resource usage
- **Cached Streams**: Provider-level caching enables instant data access
- **Filtered Streaming**: Movie-specific comments filtered from global stream
- **Controlled Subscriptions**: StreamSubscription provides precise lifecycle management
- **Widget Keys**: PageStorageKeys maintain scroll positions across segment switches
- **State Preservation**: AutomaticKeepAliveClientMixin maintains widget state across tab switches

#### Loading States
- **Custom Loading Screen**: Provides contextual feedback during movie data fetch
- **Shimmer Animations**: Animated placeholders indicate content structure
- **Clear Messaging**: "Loading movie details..." informs user of current state
- **Visual Continuity**: Loading layout matches final content structure

### Data Operations
- **Movies Create**: Use `ditto.collection('movies').upsert()`
- **Movies Read**: Use provider cached streams (`dittoProvider.moviesStream`)
- **Movies Update**: Fetch document, modify, then upsert
- **Movies Delete**: Not implemented (would use `collection.findById().remove()`)

- **Comments Create**: Use `INSERT INTO comments DOCUMENTS (:comment)` DQL statement
- **Comments Read**: Use provider filtered streams (`dittoProvider.getCommentsForMovie(movieId)`)
- **Comments Update**: Not implemented in current version
- **Comments Delete**: Not implemented in current version

### System Queries
The app supports querying system information:
```dart
// Get database indexes
final result = await ditto.store.execute('SELECT * FROM system:indexes');
// Returns: {_id: "index_name", collection: "collection_name", fields: ["field1", "field2"]}
```

## Development Guidelines

### Data Modeling (MANDATORY)
**ALWAYS create models for data structures accessed from Ditto queries or any external data sources.**

1. **Model Creation**: For ANY data structure used in the app, create a corresponding model class in `lib/models/`
2. **Serialization Pattern**: Follow the established pattern with:
   - Required and optional properties as class fields
   - `fromJson()` factory constructor for deserialization
   - Computed properties (getters) for common logic
   - Proper null safety and type conversion
3. **Consistency**: Never access raw JSON data directly in UI components - always use models
4. **Example Structure**:
   ```dart
   class DataModel {
     final String id;
     final String? optionalField;
     
     DataModel({required this.id, this.optionalField});
     
     factory DataModel.fromJson(Map<String, dynamic> json) {
       return DataModel(
         id: json['_id'] ?? '',
         optionalField: json['optional_field'],
       );
     }
     
     bool get hasOptionalField => optionalField != null;
   }
   ```

### Adding New Features
1. For new data types, create models in `lib/models/` (see Data Modeling above)
2. For reactive UI, use provider streams with `StreamBuilder` - avoid creating widget-level observers
3. Maintain offline-first approach - all operations should work without network
4. **Always provide loading states** - Use cached data from provider streams for instant loading
5. **State Preservation** - Use `AutomaticKeepAliveClientMixin` and `PageStorageKey` for maintaining state

### Testing Ditto Features
- Test offline mode by disabling network
- Test P2P sync between multiple devices/simulators
- Verify real-time updates by modifying data from different sources

### Performance Considerations
- **Use Provider Streams**: Access cached data from `DittoProvider` streams instead of creating widget observers
- **State Preservation**: Use `AutomaticKeepAliveClientMixin` to maintain widget state across tab switches
- **Scroll Position**: Use `PageView` + `PageStorageKey` to preserve scroll positions
- **Immediate Data**: Streams yield cached data immediately, then provide live updates
- **Lifecycle Management**: Use `StreamSubscription` for controlled observer lifecycle
- **Image Caching**: Use `CachedNetworkImage` to reduce bandwidth
- **Error Handling**: Implement proper error handling for network/sync failures

### Architecture Benefits
This centralized stream architecture provides:
- **No Observer Leaks**: Observers created once at app startup, no lifecycle issues
- **Instant Tab Switching**: Cached data means no loading delays when switching tabs
- **Preserved State**: Scroll positions and widget state maintained across navigation
- **Better Performance**: Single observers serve multiple UI components
- **Crash Prevention**: Eliminates race conditions from observer creation/disposal