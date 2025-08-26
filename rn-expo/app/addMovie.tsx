import { Text, View, StyleSheet, ScrollView, ActivityIndicator, TextInput, Alert, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Movie } from '../src/models/movie';
import { useAddMovie } from '../src/hooks/useAddMovie';

export default function AddMovie() {
  const router = useRouter();
  const { addMovie } = useAddMovie();
  const [formData, setFormData] = useState<Partial<Movie>>({
    title: '',
    year: '',
    plot: '',
    poster: '',
    fullplot: '',
    countries: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.title || !formData.year) {
      Alert.alert('Error', 'Title and year are required');
      return;
    }

    setIsLoading(true);
    try {
      await addMovie(formData);
      Alert.alert('Success', 'Movie added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add movie');
      console.error('Add movie error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Add Movie',
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            color: '#fff',
          },
          headerBackTitle: 'Movies',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable
                style={[styles.headerButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.headerButtonText}>Save</Text>
              </Pressable>
            </View>
          ),
        }} 
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Title"
              placeholderTextColor="#9ea3b0"
            />
            <TextInput
              style={styles.input}
              value={formData.year}
              onChangeText={(text) => setFormData({ ...formData, year: text })}
              placeholder="Year"
              placeholderTextColor="#9ea3b0"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.plot}
              onChangeText={(text) => setFormData({ ...formData, plot: text })}
              placeholder="Plot"
              placeholderTextColor="#9ea3b0"
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={styles.input}
              value={formData.poster}
              onChangeText={(text) => setFormData({ ...formData, poster: text })}
              placeholder="Poster URL"
              placeholderTextColor="#9ea3b0"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.fullplot}
              onChangeText={(text) => setFormData({ ...formData, fullplot: text })}
              placeholder="Full Plot"
              placeholderTextColor="#9ea3b0"
              multiline
              numberOfLines={5}
            />
            <TextInput
              style={styles.input}
              value={formData.countries?.join(', ')}
              onChangeText={(text) => setFormData({ ...formData, countries: text.split(',').map(c => c.trim()) })}
              placeholder="Countries (comma-separated)"
              placeholderTextColor="#9ea3b0"
            />
          </View>
        </ScrollView>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </SafeAreaView>
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 