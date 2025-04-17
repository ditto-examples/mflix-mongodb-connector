import { Text, View, StyleSheet, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { useRef } from 'react';
import { Stack, useRouter } from 'expo-router';

import { Movie } from '../src/models/movie';
import { useMovies } from '../src/hooks/useMovies';
import { MovieCard } from '../src/components/MovieCard';

export default function Index() {
  const { movies, isLoading, error } = useMovies();
  const router = useRouter();

  const renderItem = ({ item: movie }: { item: Movie }) => (
    <View style={styles.cardContainer}>
      <MovieCard 
        movie={movie}
        onPress={() => router.push({
          pathname: '/movieDetails',
          params: { id: movie.id }
        })}
      />
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Children Movies',
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
              <Text style={styles.addButtonText}>Add Movie</Text>
            </Pressable>
          ),
        }} 
      />
      <View style={styles.container}>
        {isLoading || movies.length === 0 ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : error ? (
          <Text style={styles.text}>{error}</Text>
        ) : (
          <FlatList
            data={movies}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={(item) => item.id}
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
