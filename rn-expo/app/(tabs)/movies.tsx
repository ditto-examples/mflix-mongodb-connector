import { Text, View, StyleSheet, ActivityIndicator, FlatList, Pressable, TextInput } from 'react-native';
import { useRef, useCallback, useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { MovieListing } from '../../src/models/movieListing';
import { useMovies } from '../../src/hooks/useMovies';
import { useMovieSearch } from '../../src/hooks/useMovieSearch';
import { MovieCard } from '../../src/components/MovieCard';

export default function MoviesTab() {
  const { movies, isLoading, error } = useMovies();
  const { 
    searchResults, 
    isSearching, 
    searchError, 
    searchQuery, 
    setSearchQuery, 
    clearSearch 
  } = useMovieSearch();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollPositionRef = useRef(0);
  const searchInputRef = useRef<TextInput>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    scrollPositionRef.current = 0;
  }, []);

  useEffect(() => {
    // Register scroll to top function globally
    global.scrollMoviesToTop = scrollToTop;
    
    return () => {
      // Cleanup
      delete global.scrollMoviesToTop;
    };
  }, [scrollToTop]);

  const handleScroll = useCallback((event: any) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const handleCancelSearch = useCallback(() => {
    clearSearch();
    setIsSearchActive(false);
    searchInputRef.current?.blur();
  }, [clearSearch]);

  const renderItem = useCallback(({ item: movie }: { item: MovieListing }) => (
    <View style={styles.cardContainer}>
      <MovieCard 
        movie={movie}
        onPress={() => router.push({
          pathname: '/movieDetails',
          params: { id: movie.id }
        })}
      />
    </View>
  ), [router]);

  // Determine which data to display
  // When searching, keep showing previous data until search completes
  const displayData = isSearchActive && searchQuery ? 
    (isSearching && searchResults.length === 0 ? movies : searchResults) : 
    movies;
  const displayLoading = isSearchActive ? isSearching : isLoading;
  const displayError = isSearchActive ? searchError : error;

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Kid Movies',
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            color: '#fff',
          },
          headerRight: () => (
            <Pressable
              style={styles.addButton}
              onPress={() => router.push('/addMovie')}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </Pressable>
          ),
        }} 
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9ea3b0" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search movies by title"
              placeholderTextColor="#9ea3b0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchActive(true)}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {isSearchActive && searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#9ea3b0" />
              </Pressable>
            )}
          </View>
          {isSearchActive && (
            <Pressable onPress={handleCancelSearch} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          )}
        </View>
        
        {displayError ? (
          <Text style={styles.text}>{displayError}</Text>
        ) : (
          <View style={styles.listContainer}>
            {displayLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
            <FlatList
            ref={flatListRef}
            data={displayData}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={(item) => item.id}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            removeClippedSubviews={false}
            ListEmptyComponent={
              isSearchActive && searchQuery && !isSearching ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No movies found</Text>
                  <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
                </View>
              ) : !isSearchActive && !isLoading && movies.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No movies available</Text>
                </View>
              ) : null
            }
          />
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  listContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(37, 41, 46, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#25292e',
    borderBottomWidth: 1,
    borderBottomColor: '#3d434d',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2127',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  cancelButton: {
    marginLeft: 12,
    paddingVertical: 8,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  cardContainer: {
    width: '100%',
  },
  separator: {
    height: 16,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#9ea3b0',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
});