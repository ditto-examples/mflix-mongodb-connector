# MFlix Movies - Swift iOS App

## Project Overview
This is a SwiftUI-based iOS application that connects to a MongoDB database through Ditto to display and manage movie information. The app provides a modern, native iOS interface for browsing movies, searching content, viewing details, managing movie data, monitoring sync status, and tracking database indexes.

### Modern Swift & Observable Macro Architecture
This project has been fully migrated to use the new **@Observable macro API** introduced in iOS 17/macOS 14, replacing the legacy ObservableObject protocol. All observable classes use the modern pattern for better performance and cleaner code.

**Key Architecture Decisions:**
- Uses `@Observable` macro for all observable classes (no ObservableObject)
- Leverages `@Environment` instead of @EnvironmentObject
- Uses `@State` for Observable class instances (not @StateObject)
- No `@Published` property wrappers needed
- Full Swift 6 compatibility with proper concurrency handling

**Platform Requirements:**
- **Minimum iOS Version**: 17.0
- **Minimum macOS Version**: 14.0
- **Swift Version**: 5.0+ (with @Observable macro support)
- **Swift 6 Ready**: No concurrency warnings or compatibility issues

For migration details, see: [Apple's Migration Guide](https://developer.apple.com/documentation/swiftui/migrating-from-the-observable-object-protocol-to-the-observable-macro)

## Project Structure

```
swift/mflix-movies/
├── Assets.xcassets/           		# App icons and color assets
├── Data/                      		# Data layer and services
│   ├── AppState.swift         		# Global app state (@Observable class)
│   ├── CommentsObserver.swift 		# Real-time comments (@Observable class)
│   ├── DatabaseConfig.swift  		# Database configuration and validation
│   └── DittoService.swift    		# Core data service (@Observable class)
├── Models/                   		# Data models
│   ├── Comment.swift         		# Comment data model with formatting
│   ├── IndexInfo.swift       		# Database index tracking model
│   ├── Movie.swift           		# Comprehensive Movie model
│   ├── MovieListing.swift    		# Movie listing with formatted ratings
│   ├── SyncStatus.swift      		# Sync status information model
│   └── SyncStatusInfo.swift  		# Enhanced sync status with peer tracking
├── Views/                    		# SwiftUI views
│   ├── ContentView.swift     		# Main app view with tab navigation
│   ├── MovieDetailView.swift 		# Detailed movie view with edit mode
│   ├── MoviesListView.swift  		# Movie list with search functionality
│   └── SystemView.swift      		# System info, sync status, and indexes
├── mflix_moviesApp.swift     		# App entry point
├── mflix_movies.entitlements 		# App sandboxing and security
└── dittoConfig.plist         		# Ditto configuration file
```

## Key Components

### 1. Data Models

#### Movie.swift
- Comprehensive `Movie` struct conforming to `Identifiable` and `Codable`
- **Core Properties**: id, title, plot, poster, year, fullplot, countries, rated, genres, runtime
- **Rating Properties**: imdbRating, rottenRating (Double with precision handling)
- **Extended Properties**: cast, languages, released (Date), directors, awards
- **Complex Objects**: 
  - `imdb`: Contains rating and votes
  - `tomatoes`: Contains viewer ratings and meter scores
- **Data Handling**:
  - Multiple initialization methods (Dictionary, Data, Codable)
  - ISO8601 date parsing for release dates
  - Mixed type handling for year field (String/Int)

#### MovieListing.swift
- Extended movie model optimized for list display
- **Computed Properties**:
  - `formattedImdbRating`: Returns rating with 1 decimal place
  - `formattedRottenRating`: Returns rating with 1 decimal place
- Custom initializers for handling mixed MongoDB data types
- Efficient data transformation for UI display

#### Comment.swift
- Enhanced comment model for movie reviews
- **Properties**: id, movieId, text, timestamp, name, email, author
- **Date Formatting**: Sophisticated date formatter with fallback patterns
- **Default Values**: 
  - Anonymous commenting with default email/name
  - Automatic timestamp generation
- Real-time update support through Ditto

#### IndexInfo.swift
- Database index tracking model
- **Properties**: id, indexId, documentCount, indexByteSize, createdOn
- Monitors database index creation and performance
- Used for system diagnostics and optimization

#### SyncStatusInfo.swift
- Enhanced sync status with detailed peer information
- **Properties**: peerType, id, syncSessionStatus, statusColor, syncedUpToLocalCommitId, lastUpdate
- **Peer Identification**: Distinguishes cloud servers from peer devices
- **Visual Status**: Color-coded connection states (green/orange/red/gray)
- Real-time sync progress tracking

### 2. Data Services & Observers (Observable Macro Pattern)

#### DittoService.swift (@Observable class)
- Core service layer for all database operations
- **Observable Pattern**: Uses `@Observable` macro for automatic UI updates
- **No @Published needed**: Properties automatically trigger view updates
- **Movie Operations:**
  - `getMovies()`: Fetches kid-friendly movies (G/PG rated) with real-time updates
  - `searchMovies(by title:)`: Full-text search with LIKE queries
  - `addMovie()`: Inserts new movie with validation
  - `getMovie(by:)`: Retrieves single movie by ID
  - `updateMovie()`: Selective field updates
  - `deleteMovie()`: Safe deletion with cleanup

- **Comment Operations:**
  - `getCommentsCount()`: Efficient count queries
  - `getComments(by:)`: Movie-specific comment retrieval
  - `addComment()`: Adds comments with author info

- **Search Features:**
  - Full-text title search using SQL LIKE with wildcards
  - Kid-friendly content filtering (G and PG ratings only)
  - Real-time search result updates
  - Efficient query optimization

- **Index Management:**
  - Automatic index creation on `title` and `year` fields
  - Index monitoring and statistics
  - Performance optimization through indexing

- **Database Configuration:**
  - DQL strict mode disabled for flexibility
  - V3 sync disabled for performance
  - Parameterized queries for security
  - WebSocket transport configuration

#### CommentsObserver.swift (@Observable class)
- Real-time comments synchronization using @Observable macro
- **Features:**
  - Automatic subscription lifecycle management
  - Live updates on comment additions/modifications
  - Memory-efficient cleanup on deallocation
  - Loading state management
  - **@MainActor Integration**: Proper UI updates with `Task { @MainActor in }`
- **Methods:**
  - `registerObserver()`: Establishes real-time subscription
  - `cleanup()`: Proper resource disposal

#### AppState.swift (@Observable class)
- Centralized state management using `@Observable` macro
- **State Properties** (no @Published needed):
  - `error`: App-wide error state
  - `movies`: Main movie list
  - `searchResults`: Filtered movie search results
  - `syncStatusInfos`: Real-time sync status
  - `indexes`: Database index information
  - `dittoService`: Service instance reference
- **Features:**
  - Automatic UI updates without @Published
  - Weak reference callbacks prevent retain cycles
  - Search result caching
  - App lifecycle coordination
  - View state synchronization

### 3. Views Architecture

#### ContentView.swift
- Main navigation container
- **Tab Structure:**
  - Movies Tab: Browse and search movies
  - System Tab: Monitor sync and indexes
- **Observable Integration:**
  - Uses `@Environment(AppState.self)` for state access
  - No @EnvironmentObject needed
- Tab selection state management

#### MoviesListView.swift
- Advanced movie browsing interface
- **Observable Integration:**
  - Uses `@Environment(AppState.self)` for state access
  - Direct property access without @ObservedObject
- **Search Functionality:**
  - `.searchable()` modifier with real-time updates
  - Search state management with `onChange()` and `onSubmit()`
  - Empty search state UI
  - "No results found" state
  - Search results display with highlighting

- **MovieRowView Component:**
  - Async image loading with fallback icons
  - Conditional rating display
  - Card-based design with shadows
  - Navigation to detail view

- **Features:**
  - Add movie functionality
  - Pull-to-refresh capability
  - Loading and error states
  - Empty state management

#### MovieDetailView.swift
- Comprehensive movie details interface
- **Observable Integration:**
  - Uses `@Environment(AppState.self)` for app state
  - `@State private var commentsObserver = CommentsObserver()` for local observable
  - No @StateObject or @ObservedObject needed
- **Segmented Interface:**
  - Details Tab: Movie information display
  - Comments Tab: Real-time comment section

- **Edit Mode System:**
  - Full movie field editing
  - TextEditor for multi-line fields
  - TextField for single-line inputs
  - Countries array parsing from comma-separated strings
  - Selective field updates (only changed fields)
  - Save/Cancel functionality with alerts

- **Comments Features:**
  - `CommentsInlineView`: Embedded comment display
  - `AddCommentView`: Modal sheet for new comments
  - Real-time updates via CommentsObserver (@Observable class)
  - Loading states and error handling

- **UI Components:**
  - `DetailRow`: Consistent field display
  - Large centered ProgressView for loading
  - Async image with multiple fallback states
  - Alert system for confirmations

#### SystemView.swift
- System diagnostics and monitoring
- **Observable Integration:**
  - Uses `@Environment(AppState.self)` throughout all subviews
  - Real-time updates without manual observation
- **Segmented Interface:**
  - Sync Status Tab: Peer connections and sync progress
  - Indexes Tab: Database index management

- **Sync Status Features:**
  - `SyncStatusRowView`: Individual peer display
  - `StatusIndicator`: Color-coded connection status
  - Real-time peer discovery
  - Cloud server identification
  - Commit ID tracking with proper formatting
  - Last update timestamps

- **Index Management:**
  - `IndexesView`: List of database indexes
  - `IndexRowView`: Index details and statistics
  - Document count display
  - Index size monitoring
  - Creation date tracking

### 4. Advanced Features

#### Search System
- **Implementation Details:**
  - Real-time search as user types
  - SQL LIKE queries with % wildcards
  - Case-insensitive matching
  - Kid-friendly content filtering
  - Search state persistence

- **UI States:**
  - Active search with results
  - Empty search (no query)
  - No results found
  - Loading during search

#### Edit Mode System
- **Field Management:**
  - Separate state variables for each field
  - Only updates modified fields
  - Data validation and type conversion
  - Complex field parsing (arrays, dates)

- **User Experience:**
  - Edit/Done mode toggle
  - Confirmation alerts
  - Error handling
  - Undo capability through cancel

#### Error Handling & Configuration
- **DittoError Enum:**
  - `general`: Generic errors
  - `configError`: Configuration issues
  - Proper error propagation

- **Configuration Validation:**
  - Placeholder text detection
  - Token validation
  - WebSocket URL verification
  - Development mode detection

#### UI Components Library
- **Reusable Components:**
  - `MovieRowView`: Movie list items
  - `CommentRowView`: Comment display
  - `IndexRowView`: Index information
  - `SyncStatusRowView`: Peer status
  - `DetailRow`: Key-value display
  - `StatusIndicator`: Connection status
  - `AddCommentView`: Comment input modal
  - `CommentsInlineView`: Embedded comments

- **Design Patterns:**
  - Card-based layouts with shadows
  - Consistent spacing and typography
  - Loading animations with scale effects
  - Color-coded status indicators

## Database Schema

### Movies Collection
```swift
{
  "_id": String,
  "title": String,
  "plot": String,
  "poster": String (URL),
  "year": String/Int,
  "imdbRating": Double?,
  "rottenRating": Double?,
  "fullplot": String?,
  "countries": [String]?,
  "rated": String?,
  "genres": [String]?,
  "runtime": Int?,
  "cast": [String]?,
  "languages": [String]?,
  "released": Date?,
  "directors": [String]?,
  "awards": String?,
  "imdb": {
    "rating": Double?,
    "votes": Int?
  },
  "tomatoes": {
    "viewer": {
      "rating": Double?,
      "meter": Int?
    }
  }
}
```

### Comments Collection
```swift
{
  "_id": String,
  "movie_id": String,
  "text": String,
  "timestamp": Date,
  "name": String (default: "Anonymous"),
  "email": String (default: "anonymous@mflix.com"),
  "author": String?
}
```

### Sync Status Collection
```swift
{
  "peerType": String,
  "id": String,
  "syncSessionStatus": String,
  "statusColor": String,
  "syncedUpToLocalCommitId": String,
  "lastUpdate": Date
}
```

### Index Info Collection
```swift
{
  "_id": String,
  "indexId": String,
  "documentCount": Int,
  "indexByteSize": Int,
  "createdOn": Date
}
```

## Ditto Integration

### Configuration
- **dittoConfig.plist**: Central configuration file
- **Authentication**: Token-based with expiration handling
- **Transport**: WebSocket URL configuration
- **Sync Settings**: V3 sync disabled, DQL strict mode off
- **Security**: App sandboxing enabled

### Database Operations
- **Query Types:**
  - Parameterized queries for injection prevention
  - JOIN operations for related data
  - Projection for field selection
  - Filtering with WHERE clauses

- **Subscriptions:**
  - Real-time movie updates
  - Live comment synchronization
  - Sync status monitoring
  - Index tracking

### Index Strategy
- **Created Indexes:**
  - `title`: For search optimization
  - `year`: For chronological queries
- **Benefits:**
  - Faster search performance
  - Improved query efficiency
  - Reduced resource usage

### Observer Patterns
- **Implementation:**
  - CommentsObserver for comment updates
  - Movie subscription in DittoService
  - Sync status real-time monitoring
  - Index information tracking

- **Lifecycle Management:**
  - Automatic cleanup in `deinit`
  - Manual cleanup in `onDisappear`
  - Weak reference prevention of retain cycles

## Architecture Patterns

### Modern Observable Architecture (iOS 17+)
- **Views**: SwiftUI declarative UI with @Environment
- **Observable Classes**: Using @Observable macro (not ObservableObject)
- **Models**: Plain structs with Codable
- **State Management**: 
  - `@State` for Observable class instances
  - `@Environment` for shared state access
  - No @StateObject, @ObservedObject, or @EnvironmentObject

### Dependency Injection Pattern
- **Environment Injection**: `.environment(appState)` in app root
- **Access Pattern**: `@Environment(AppState.self)` in views
- **Local Observables**: `@State private var observer = MyObservable()`

### Repository Pattern
- **DittoService**: Data access abstraction (@Observable class)
- **Observers**: Real-time data streams (@Observable classes)
- **AppState**: State coordination (@Observable class)

### Error Handling
- **Result Types**: Success/failure handling
- **Custom Errors**: DittoError enum
- **Alert System**: User-facing error display
- **Fallback Values**: Graceful degradation

## Development Guidelines

### Adding New Features
1. **Models**: Create plain structs in `Models/` with Codable conformance
2. **Services**: Extend `DittoService.swift` (@Observable class) with new methods
3. **Observers**: Create new @Observable classes in `Data/` for real-time features
4. **Views**: Add SwiftUI views using `@Environment(AppState.self)` pattern
5. **State**: Update `AppState.swift` properties (no @Published needed)

### Code Quality Standards
- **Type Safety**: Use proper type checking with `as?`
- **Memory Management**: 
  - Implement cleanup in deinit
  - Use weak references in closures `[weak self]`
  - Proper @MainActor usage for UI updates
- **Observable Best Practices**:
  - Always use @Observable macro for observable classes
  - No @Published properties needed
  - Use @Environment for shared state
  - Use @State for local Observable instances
- **Error Handling**: Never force unwrap, use guard/if let
- **Performance**: Use LazyVStack for lists
- **Security**: Always use parameterized queries

### UI/UX Guidelines
- **Design System**:
  - Card-based components
  - Consistent spacing (8pt grid)
  - Shadow effects for depth
  - Rounded corners (12pt radius)

- **Loading States**:
  - ProgressView for async operations
  - Skeleton screens for content
  - Error states with retry options

- **Navigation**:
  - Tab-based main navigation
  - Sheet presentations for modals
  - NavigationStack for hierarchical flow

## Observable Macro Code Examples

### Creating an Observable Class
```swift
// Modern pattern (iOS 17+)
@Observable class MyService {
    var data: [Item] = []        // No @Published needed
    var isLoading = false         // Automatically observable
    var error: Error?             // All properties are observable
    
    func fetchData() async {
        isLoading = true
        // ... fetch logic
        isLoading = false
    }
}

// Legacy pattern (deprecated)
class MyService: ObservableObject {
    @Published var data: [Item] = []
    @Published var isLoading = false
    @Published var error: Error?
}
```

### Using Observable in App Root
```swift
// Modern pattern
@main
struct MyApp: App {
    @State private var appState = AppState()  // @State, not @StateObject
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(appState)  // Pass to environment
        }
    }
}

// Legacy pattern (deprecated)
@StateObject private var appState = AppState()
ContentView().environmentObject(appState)
```

### Accessing Observable in Views
```swift
// Modern pattern
struct MyView: View {
    @Environment(AppState.self) private var appState  // Type-safe access
    
    var body: some View {
        Text(appState.title)  // Direct property access
    }
}

// Legacy pattern (deprecated)
@EnvironmentObject var appState: AppState
```

### Local Observable State
```swift
// Modern pattern
struct DetailView: View {
    @State private var viewModel = DetailViewModel()  // @State for local Observable
    
    var body: some View {
        // viewModel properties automatically trigger updates
    }
}

// Legacy pattern (deprecated)
@StateObject private var viewModel = DetailViewModel()
```

### Async Updates with @MainActor
```swift
@Observable class DataService {
    var items: [Item] = []
    
    func loadItems() async {
        let fetchedItems = await fetchFromAPI()
        
        // Update UI on main thread
        await MainActor.run {
            self.items = fetchedItems
        }
        
        // Or use Task with @MainActor
        Task { @MainActor in
            self.items = fetchedItems
        }
    }
}
```

### Weak References in Closures
```swift
@Observable class AppState {
    var dittoService: DittoService
    
    init() {
        dittoService = DittoService()
        
        // Prevent retain cycles with weak self
        dittoService.onError = { [weak self] error in
            self?.handleError(error)
        }
        
        dittoService.onUpdate = { [weak self] data in
            self?.updateData(data)
        }
    }
}
```

## Common Issues & Solutions

### Search Not Working
- **Problem**: Search returns no results despite matching titles
- **Solution**: Ensure database indexes are created on title field

### Edit Mode Not Saving
- **Problem**: Changes in edit mode don't persist
- **Solution**: Check that only modified fields are being updated

### Comments Not Real-Time
- **Problem**: New comments don't appear immediately
- **Solution**: Verify CommentsObserver is registered and not cleaned up prematurely

### Sync Status Not Updating
- **Problem**: Peer connections not showing
- **Solution**: Check WebSocket configuration and network permissions

### Type Conversion Errors
- **Problem**: Crashes when parsing MongoDB data
- **Solution**: Use safe casting with fallback values

## Performance Optimization

### List Rendering
- LazyVStack for on-demand rendering
- Image caching with AsyncImage
- Automatic minimal view updates (no @Published needed)

### Data Loading
- Pagination support ready
- Efficient queries with projections
- Index usage for common queries

### Memory Management
- Subscription cleanup on view dismissal
- Weak references in closures
- Automatic observer deallocation

### Real-Time Updates
- Debounced search queries
- Selective field updates
- Efficient diff algorithms in Ditto

## Testing Strategy

### Unit Tests
- Model serialization/deserialization
- Service method validation
- Date formatting edge cases
- Search query generation

### UI Tests
- Navigation flow testing
- Search functionality
- Edit mode operations
- Comment submission

### Integration Tests
- Ditto sync verification
- Real-time update testing
- Error scenario handling
- Network failure recovery

## Security Considerations

### Data Protection
- App sandboxing enabled
- Parameterized queries only
- No hardcoded credentials
- Token-based authentication

### Content Filtering
- Kid-friendly content (G/PG only)
- Appropriate content validation
- User input sanitization

### Error Handling
- No sensitive data in logs
- Generic error messages to users
- Proper error recovery

## Dependencies

- **SwiftUI**: Native iOS UI framework (iOS 17.0+ for @Observable)
- **DittoSwift**: MongoDB sync and real-time updates
- **Foundation**: Core iOS functionality
- **Observation Framework**: @Observable macro support (iOS 17.0+)

## Recent Updates

### Observable Macro Migration (iOS 17+)
- **Complete migration** from ObservableObject to @Observable
- All observable classes now use @Observable macro
- Views use @Environment instead of @EnvironmentObject
- @State for Observable instances (not @StateObject)
- No @Published properties needed
- Swift 6 compatibility with proper concurrency

### Search Functionality
- Full-text search implementation
- Real-time search results
- Kid-friendly content filtering
- Search state management

### Database Indexing
- Automatic index creation
- Index monitoring UI
- Performance optimization

### Enhanced Edit Mode
- Comprehensive field editing
- Selective updates
- Validation and error handling

### Improved Comments
- Enhanced comment model with @Observable
- Better date formatting
- Anonymous commenting support
- @MainActor integration for UI updates

## Future Enhancements

### Planned Features
- Advanced search filters (genre, year, rating)
- User authentication system
- Favorites and watchlist
- Offline mode improvements
- Data export/import

### UI Improvements
- Dark mode support
- Accessibility enhancements
- Haptic feedback
- Animation refinements

### Performance
- Image preloading
- Query result caching
- Background sync optimization
- Batch operations support

### Social Features
- User profiles
- Movie reviews and ratings
- Social sharing
- Friend recommendations

### Analytics
- Usage tracking
- Performance monitoring
- Sync analytics dashboard
- Error reporting

## Troubleshooting

### Build Issues
- Clean build folder: Cmd+Shift+K
- Reset package caches: File > Packages > Reset Package Caches
- Check minimum iOS version (15.0)

### Runtime Issues
- Enable Ditto logging for debugging
- Check network permissions
- Verify configuration file values
- Monitor memory usage in Instruments

### Sync Issues
- Verify internet connectivity
- Check WebSocket URL validity
- Ensure proper authentication
- Review firewall settings

## Support

For issues or questions:
- Check Ditto documentation
- Review MongoDB connector guides
- Consult SwiftUI resources
- Contact development team