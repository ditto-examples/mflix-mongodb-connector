import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

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
          pathname: '/movie',
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
        }} 
      />
      <View style={styles.container}>
        {isLoading || movies.length === 0 ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : error ? (
          <Text style={styles.text}>{error}</Text>
        ) : (
          <FlashList
            data={movies}
            renderItem={renderItem}
            estimatedItemSize={1000}
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
  },
});
