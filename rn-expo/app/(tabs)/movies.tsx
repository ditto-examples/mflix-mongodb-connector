import { Text, View, StyleSheet, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { useRef, useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Movie } from '../../src/models/movie';
import { useMoviesOptimized } from '../../src/hooks/useMoviesOptimized';
import { MovieCard } from '../../src/components/MovieCard';

export default function MoviesTab() {
  const { movies, isLoading, error } = useMoviesOptimized();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollPositionRef = useRef(0);

  const handleScroll = useCallback((event: any) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const renderItem = useCallback(({ item: movie }: { item: Movie }) => (
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

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Movies',
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
        {isLoading && movies.length === 0 ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : error ? (
          <Text style={styles.text}>{error}</Text>
        ) : (
          <FlatList
            ref={flatListRef}
            data={movies}
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
          />
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