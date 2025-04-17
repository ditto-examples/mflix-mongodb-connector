import { Text, View, StyleSheet, ScrollView, ActivityIndicator, TextInput, Alert, Pressable } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useMovie } from '../src/hooks/useMovie';
import { useMovieImage } from '../src/hooks/useMovieImage';
import { useUpdateMovie } from '../src/hooks/useUpdateMovie';
import { useState } from 'react';
import { Movie } from '../src/models/movie';

export default function MovieDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { movie, isLoading: isLoadingMovie, error, refresh } = useMovie(id);
  const { imageSource, isLoading: isLoadingImage, setIsLoading: setIsLoadingImage } = useMovieImage(movie?.poster);
  const { updateMovie } = useUpdateMovie();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Movie>>({});

  const handleEdit = () => {
    if (movie) {
      setFormData({
        title: movie.title,
        year: movie.year,
        plot: movie.plot,
        poster: movie.poster,
        fullplot: movie.fullplot,
        countries: movie.countries,
      });
      setIsEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!movie) return;

    try {
      await updateMovie(movie, formData);
      await refresh();
      setIsEditMode(false);
      Alert.alert('Success', 'Movie updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update movie');
      console.error('Update error:', error);
    }
  };

  const renderEditForm = () => (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
        placeholder="Title"
      />
      <TextInput
        style={styles.input}
        value={formData.year}
        onChangeText={(text) => setFormData({ ...formData, year: text })}
        placeholder="Year"
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.plot}
        onChangeText={(text) => setFormData({ ...formData, plot: text })}
        placeholder="Plot"
        multiline
        numberOfLines={3}
      />
      <TextInput
        style={styles.input}
        value={formData.poster}
        onChangeText={(text) => setFormData({ ...formData, poster: text })}
        placeholder="Poster URL"
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.fullplot}
        onChangeText={(text) => setFormData({ ...formData, fullplot: text })}
        placeholder="Full Plot"
        multiline
        numberOfLines={5}
      />
      <TextInput
        style={styles.input}
        value={formData.countries?.join(', ')}
        onChangeText={(text) => setFormData({ ...formData, countries: text.split(',').map(c => c.trim()) })}
        placeholder="Countries (comma-separated)"
      />
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: movie?.title || 'Movie',
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            color: '#fff',
          },
          headerRight: () => (
            <View style={styles.headerButtons}>
              {!isEditMode ? (
                <Pressable
                  style={styles.headerButton}
                  onPress={handleEdit}
                >
                  <Text style={styles.headerButtonText}>Edit</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    style={[styles.headerButton, styles.cancelButton]}
                    onPress={() => setIsEditMode(false)}
                  >
                    <Text style={styles.headerButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.headerButton, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <Text style={styles.headerButtonText}>Save</Text>
                  </Pressable>
                </>
              )}
            </View>
          ),
        }} 
      />
      <View style={styles.container}>
        {isLoadingMovie ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : movie ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.imageContainer}>
              {isLoadingImage && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              <Image
                source={imageSource}
                style={styles.poster}
                contentFit="cover"
                onLoadStart={() => setIsLoadingImage(true)}
                onLoadEnd={() => setIsLoadingImage(false)}
                transition={1000}
                cachePolicy="memory-disk"
              />
            </View>
            {isEditMode ? (
              renderEditForm()
            ) : (
              <View style={styles.detailsContainer}>
                <Text style={styles.title}>{movie.title}</Text>
                <Text style={styles.year}>Year: {movie.year}</Text>
                <Text style={styles.rating}>Rated: {movie.rated}</Text>
                {movie.genres && (
                  <Text style={styles.genres}>Genres: {movie.genres.join(', ')}</Text>
                )}
                <Text style={styles.sectionTitle}>Plot</Text>
                <Text style={styles.plot}>{movie.plot}</Text>
                {movie.fullplot && (
                  <>
                    <Text style={styles.sectionTitle}>Full Plot</Text>
                    <Text style={styles.plot}>{movie.fullplot}</Text>
                  </>
                )}
                {movie.directors && (
                  <Text style={styles.directors}>Directors: {movie.directors.join(', ')}</Text>
                )}
                {movie.languages && (
                  <Text style={styles.languages}>Languages: {movie.languages.join(', ')}</Text>
                )}
                {movie.countries && (
                  <Text style={styles.countries}>Countries: {movie.countries.join(', ')}</Text>
                )}
                {movie.imdb && (
                  <Text style={styles.imdbRating}>
                    IMDB Rating: {movie.imdb['rating'] || 'N/A'} ({movie.imdb['votes'] || 'no'} votes)
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  imageContainer: {
    height: 300,
    width: '100%',
    backgroundColor: '#1e2127',
    marginBottom: 16,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
    gap: 8,
  },
  formContainer: {
    padding: 16,
    gap: 16,
  },
  input: {
    backgroundColor: '#1e2127',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3d434d',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  year: {
    fontSize: 16,
    color: '#9ea3b0',
  },
  rating: {
    fontSize: 16,
    color: '#9ea3b0',
  },
  genres: {
    fontSize: 16,
    color: '#9ea3b0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  plot: {
    fontSize: 16,
    color: '#9ea3b0',
    lineHeight: 24,
  },
  directors: {
    fontSize: 16,
    color: '#9ea3b0',
    marginTop: 8,
  },
  languages: {
    fontSize: 16,
    color: '#9ea3b0',
  },
  countries: {
    fontSize: 16,
    color: '#9ea3b0',
  },
  imdbRating: {
    fontSize: 16,
    color: '#9ea3b0',
    marginTop: 8,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 16,
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#3d434d',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
}); 