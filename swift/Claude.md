# MFlix Movies - Swift iOS App

## Project Overview
This is a SwiftUI-based iOS application that connects to a MongoDB database through Ditto to display and manage movie information. The app provides a modern, native iOS interface for browsing movies, viewing details, managing movie data, and monitoring sync status.

## Project Structure

```
swift/mflix-movies/
├── Assets.xcassets/           		# App icons and color assets
├── Data/                      		# Data layer and services
│   ├── AppState.swift         		# Global app state management
│   ├── CommentsObserver.swift 		# Real-time comments observer
│   ├── DatabaseConfig.swift  		# Database configuration
│   └── DittoService.swift    		# Core data service for Ditto operations
├── Models/                   		# Data models
│   ├── Comment.swift         		# Comment data model
│   ├── Movie.swift           		# Core Movie model
│   ├── MovieListing.swift    		# Movie listing with formatted ratings
│   └── SyncStatus.swift      		# Sync status information model
├── Views/                    		# SwiftUI views
│   ├── ContentView.swift     		# Main app view with tab navigation
│   ├── MovieDetailView.swift 		# Detailed movie view with comments
│   ├── MoviesListView.swift  		# Movie list with row views
│   └── SystemView.swift      		# System information and sync status
├── mflix_moviesApp.swift     		# App entry point
└── dittoConfig.plist         		# Ditto configuration file
```

## Key Components

### 1. Data Models

#### Movie.swift
- Core `Movie` struct conforming to `Identifiable` and `Codable`
- Properties: id, title, plot, poster, year, imdbRating, rottenRating, fullplot, countries, rated, genres, runtime
- Handles mixed data types from MongoDB (especially year field)

#### MovieListing.swift
- Extended movie model for list display
- Includes computed properties for formatted ratings:
  - `formattedImdbRating`: Returns rating with 1 decimal place
  - `formattedRottenRating`: Returns rating with 1 decimal place
- Custom initializers for handling mixed data types from MongoDB

#### Comment.swift
- Comment data model for movie reviews and discussions
- Properties: id, movieId, text, timestamp, author
- Supports real-time updates through Ditto

#### SyncStatus.swift
- Sync status information model
- Properties: peerType, id, syncSessionStatus, statusColor, syncedUpToLocalCommitId, lastUpdate
- Tracks connection status and sync progress

### 2. Data Services & Observers

#### DittoService.swift
- Core service for all database operations
- **Key Functions:**
  - `getMovies()`: Fetches all movies with real-time updates
  - `addMovie()`: Inserts new movie into database
  - `getMovie(by:)`: Retrieves single movie by ID
  - `updateMovie()`: Updates existing movie data
  - `deleteMovie()`: Removes movie from database
  - `getCommentsCount()`: Gets comment count for a movie
  - `getComments(by:)`: Retrieves comments for a specific movie
  - `addComment()`: Adds new comment to a movie

- **Database Operations:**
  - Uses parameterized queries for security
  - Handles mixed data types gracefully
  - Real-time subscription to movie changes
  - Proper error handling and fallbacks

#### CommentsObserver.swift
- Real-time comments observer using Ditto
- **Key Features:**
  - Automatic subscription to comment changes
  - Real-time updates when comments are added/modified
  - Efficient memory management with cleanup
  - Loading state management
- **Methods:**
  - `registerObserver()`: Sets up real-time subscription
  - `cleanup()`: Properly disposes of subscriptions

#### AppState.swift
- Global state management using `@StateObject`
- Manages Ditto service instance
- Handles app lifecycle and data persistence
- Coordinates between different views and services

### 3. Views Architecture

#### ContentView.swift
- Main app container view with tab navigation
- **Tab Structure:**
  - Movies tab: Displays movie list
  - Sync Status tab: Shows system sync information
- Integrates with Ditto service and manages app state

#### MoviesListView.swift
- Displays list of movies using `LazyVStack`
- **MovieRowView**: Individual movie row component
  - Async image loading with fallback
  - Conditional rating display (only shows when ratings exist)
  - Clean, card-based design
- **Features:**
  - Add new movie functionality
  - Error handling and loading states
  - Empty state management

#### MovieDetailView.swift
- Detailed view of selected movie with tabbed interface
- **Tabbed Content:**
  - Details tab: Movie information and edit mode
  - Comments tab: Real-time comments with inline view
- **Features:**
  - Edit movie information
  - Real-time comments using CommentsObserver
  - Large, centered loading ProgressView
  - Async image loading with fallbacks

#### SystemView.swift
- System information and sync status display
- **Features:**
  - Sync status monitoring
  - Connected peers information
  - Real-time sync updates
  - System health indicators

### 4. Key Features

#### Rating Display Logic
The app intelligently handles movie ratings:
- Only displays ratings when they actually exist
- Shows both ratings in HStack when available
- Shows single rating when only one exists
- No ratings section when neither exists
- All ratings formatted to 1 decimal place

#### Real-Time Comments System
- **CommentsObserver**: Automatically updates comments in real-time
- **Inline Comments View**: Integrated comments display within movie details
- **Add Comments**: Users can add new comments to movies
- **Loading States**: Proper loading indicators for comment operations

#### Sync Status Monitoring
- **Real-time Updates**: Live sync status information
- **Peer Connection**: Shows connected peers and their status
- **Commit Tracking**: Displays sync progress and commit numbers
- **Status Indicators**: Visual indicators for connection status

#### Image Handling
- Async image loading with proper error handling
- Fallback to system icon when poster fails to load
- Loading states with progress indicators
- Optimized image sizing and caching

#### Data Type Handling
- Robust handling of mixed MongoDB data types
- Year field supports both Int and String
- Rating fields handle precision issues gracefully
- Proper type conversion for sync status data

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
  "runtime": Int?
}
```

### Comments Collection
```swift
{
  "_id": String,
  "movie_id": String,
  "text": String,
  "timestamp": Date,
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

## Ditto Integration

### Configuration
- Uses `dittoConfig.plist` for Ditto setup
- Real-time synchronization with MongoDB
- Subscription-based data updates
- Efficient peer-to-peer sync

### Query Patterns
- Parameterized queries for security
- Real-time subscriptions for live updates
- Proper error handling and fallbacks
- Optimized subscription management

### Observer Pattern
- **CommentsObserver**: Real-time comment updates
- **Movies Observer**: Live movie data changes
- **Sync Status Observer**: Real-time sync information
- Proper cleanup and memory management

## Development Guidelines

### Adding New Features
1. **Models**: Extend existing models or create new ones in `Models/`
2. **Services**: Add new methods to `DittoService.swift`
3. **Observers**: Create new observers for real-time data in `Data/`
4. **Views**: Create new SwiftUI views in `Views/`
5. **State**: Update `AppState.swift` if global state changes needed

### Data Handling Best Practices
- Always use parameterized queries
- Handle mixed data types gracefully
- Provide fallbacks for missing data
- Use computed properties for data formatting
- Implement proper observer cleanup

### UI/UX Patterns
- Card-based design for movie items
- Conditional rendering for optional data
- Async image loading with proper states
- Consistent typography and spacing
- Tabbed interfaces for complex content
- Real-time data updates with loading states

## Common Issues & Solutions

### Rating Display Issues
- **Problem**: Ratings showing as "N/A" when data exists
- **Solution**: Use `formattedImdbRating` and `formattedRottenRating` computed properties

### Type Conversion Errors
- **Problem**: `Int($0.value["field"])` casting failures
- **Solution**: Use proper type checking with `as?` and handle multiple possible types

### Image Loading Failures
- **Problem**: Movie posters not displaying
- **Solution**: Check URL validity and provide fallback system icons

### Comments Not Updating
- **Problem**: Comments not reflecting real-time changes
- **Solution**: Ensure CommentsObserver is properly registered and cleanup is called

### Sync Status Display Issues
- **Problem**: Commit numbers showing with commas
- **Solution**: Use NumberFormatter with `usesGroupingSeparator = false`

## Performance Considerations

- Uses `LazyVStack` for efficient list rendering
- Async image loading to prevent UI blocking
- Real-time updates without manual refresh
- Efficient data subscription management
- Proper observer cleanup to prevent memory leaks
- Optimized sync status queries

## Testing

- Unit tests for data models
- UI tests for view interactions
- Integration tests for Ditto service
- Observer pattern testing
- Mock data support for development
- Sync status testing

## Dependencies

- **SwiftUI**: Native iOS UI framework
- **DittoSwift**: MongoDB synchronization and real-time updates
- **Foundation**: Core iOS functionality
- **Combine**: Reactive programming for state management

## Recent Updates

### Comments System
- Added real-time comments functionality
- Implemented CommentsObserver for live updates
- Integrated comments inline within movie details
- Added comment management and display

### Sync Status Monitoring
- Added comprehensive sync status tracking
- Real-time peer connection monitoring
- Commit number formatting improvements
- Enhanced system health indicators

### UI Improvements
- Larger, centered ProgressView for loading states
- Tabbed interface for movie details
- Improved navigation and spacing
- Better error handling and loading states

## Future Enhancements

- Search and filtering capabilities
- User authentication and favorites
- Offline mode support
- Enhanced movie metadata
- Social features (reviews, ratings)
- Push notifications for updates
- Advanced sync analytics
- Comment moderation tools
- Movie recommendations
- User profiles and preferences
