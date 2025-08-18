# MFlix Expo React Native App - Development Guidelines

## Project Overview
This is an Expo React Native application for the MFlix MongoDB connector project.

## Development Guidelines

### Architecture & Patterns
- **Use React Hooks exclusively** - All components should be functional components using hooks
- No class components should be introduced
- Prefer custom hooks for reusable logic

### Performance Requirements
- **UI Thread Protection** - Ensure all heavy computations are moved off the main thread
- **Performance Testing Mandatory** - Any changes must be tested to verify they don't cause UI pauses or jank
- Use React.memo, useMemo, and useCallback strategically to prevent unnecessary re-renders
- Implement proper list virtualization for large datasets
- Optimize image loading and caching

### Testing Performance Changes
When making changes, always verify:
1. UI remains responsive during data loading
2. Smooth scrolling in lists and navigation
3. No blocking operations on the main thread
4. Memory usage remains stable
5. Animation performance is not degraded

### Development Commands
- Start development server: `npx expo start`
- iOS development: `npx expo run:ios`
- Android development: `npx expo run:android`

### Data Models
- **All database data MUST have models** - Any data retrieved from the database must have a corresponding TypeScript model/interface stored in the `src/models/` folder
- Models define the shape and types of data structures
- Use models for type safety and data validation

### Code Quality
- Follow React Native best practices
- Use TypeScript for type safety
- Implement proper error boundaries
- Handle loading and error states appropriately

### Performance Tools
- Use Flipper for performance profiling
- Monitor bundle size and startup time
- Profile with React DevTools Profiler
- Test on both debug and release builds

## Project Structure

### Main App Files
- `app/` - Expo Router app directory containing main screens
  - `_layout.tsx` - Root layout component with Stack navigator
  - `index.tsx` - Entry point that redirects to Movies tab
  - `(tabs)/` - Tab navigation directory
    - `_layout.tsx` - Tab navigator configuration with Movies and System tabs
    - `movies.tsx` - Movies list screen with optimized data fetching
    - `system.tsx` - System information screen
  - `addMovie.tsx` - Add new movie screen
  - `movieDetails.tsx` - Movie details screen

### Source Code Organization
- `src/` - Main source code directory
  - `components/` - Reusable UI components
    - `MovieCard.tsx` - Movie card component
  - `hooks/` - Custom React hooks for data fetching and state management
    - `useAddMovie.ts` - Hook for adding movies
    - `useMovie.ts` - Hook for fetching single movie
    - `useMovieImage.ts` - Hook for movie image handling
    - `useMovies.ts` - Original hook for fetching movie lists
    - `useMoviesOptimized.ts` - Optimized hook that prevents unnecessary DB pulls when switching tabs
    - `useUpdateMovie.ts` - Hook for updating movies
  - `models/` - TypeScript interfaces/types for data structures
    - `movie.ts` - Movie data model (REQUIRED for all database data)
  - `providers/` - React context providers
    - `DittoContext.tsx` - Ditto database context
    - `DittoContextType.ts` - Context type definitions
    - `DittoProvider.tsx` - Main provider component
  - `services/` - Business logic and API services
    - `dittoService.ts` - Ditto database service layer
  - `assets/` - Static assets (images, etc.)

### Configuration Files
- `package.json` - Dependencies and scripts
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration
- `metro.config.js` - Metro bundler configuration

### iOS Specific
- `ios/` - Native iOS project files
- Built using CocoaPods for dependency management

## Tab Navigation Implementation

### Features
- **Bottom Tab Bar** - Uses Expo Router's Tabs component with two tabs:
  - Movies tab with film icon - Shows the movie list
  - System tab with cog icon - Shows system information
- **Optimized Data Fetching** - The `useMoviesOptimized` hook prevents unnecessary database pulls when switching between tabs
- **Scroll Position Persistence** - The Movies tab maintains scroll position when navigating away and returning
- **State Preservation** - Movie data is cached and persists across tab switches without re-fetching

### Key Implementation Details
1. **Tab Navigation Structure** - Using Expo Router's file-based routing with `(tabs)` directory
2. **Observer Management** - Database observer is registered once and persists across tab switches
3. **Performance Optimizations**:
   - Movies array is memoized using `useMemo` to prevent unnecessary re-renders
   - `useCallback` is used for render functions to optimize FlatList performance
   - Observer registration status is tracked with `useRef` to prevent duplicate observers
   - Movies are cached in memory for instant display when returning to the tab

### Testing
- iOS build tested successfully on iPhone 16 Pro Max simulator
- Android build tested successfully on SM_A515U emulator
- Both platforms show proper tab navigation and state persistence