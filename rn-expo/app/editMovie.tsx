import { Text, View, StyleSheet, ScrollView, TextInput, Alert, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMovie } from '../src/hooks/useMovie';
import { useUpdateMovie } from '../src/hooks/useUpdateMovie';
import { useState, useEffect } from 'react';
import { Movie } from '../src/models/movie';

export default function EditMovie() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { movie, isLoading: isLoadingMovie, error, refresh } = useMovie(id);
  const { updateMovie } = useUpdateMovie();
  const [formData, setFormData] = useState<Partial<Movie>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        year: movie.year,
        plot: movie.plot,
        poster: movie.poster,
        fullplot: movie.fullplot,
        countries: movie.countries,
        genres: movie.genres,
        directors: movie.directors,
        languages: movie.languages,
        rated: movie.rated,
      });
    }
  }, [movie]);

  const handleSave = async () => {
    if (!movie) return;

    try {
      setIsSaving(true);
      await updateMovie(movie, formData);
      await refresh();
      Alert.alert('Success', 'Movie updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update movie');
      console.error('Update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoadingMovie) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !movie) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || 'Movie not found'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Edit Movie',
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            color: '#fff',
          },
          headerLeft: () => (
            <Pressable
              style={styles.headerButton}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={styles.headerButtonText}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              style={[styles.headerButton, styles.saveButton, isSaving && styles.disabledButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.headerButtonText}>Save</Text>
              )}
            </Pressable>
          ),
        }} 
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter movie title"
                placeholderTextColor="#6b7280"
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.input}
                value={formData.year}
                onChangeText={(text) => setFormData({ ...formData, year: text })}
                placeholder="Enter release year"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rating</Text>
              <TextInput
                style={styles.input}
                value={formData.rated}
                onChangeText={(text) => setFormData({ ...formData, rated: text })}
                placeholder="Enter rating (G, PG, PG-13, R)"
                placeholderTextColor="#6b7280"
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Plot</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.plot}
                onChangeText={(text) => setFormData({ ...formData, plot: text })}
                placeholder="Enter plot summary"
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={3}
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Plot</Text>
              <TextInput
                style={[styles.input, styles.textArea, styles.largeTextArea]}
                value={formData.fullplot}
                onChangeText={(text) => setFormData({ ...formData, fullplot: text })}
                placeholder="Enter full plot description"
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={5}
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Poster URL</Text>
              <TextInput
                style={styles.input}
                value={formData.poster}
                onChangeText={(text) => setFormData({ ...formData, poster: text })}
                placeholder="Enter poster image URL"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Genres (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={formData.genres?.join(', ')}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  genres: text.split(',').map(g => g.trim()).filter(g => g) 
                })}
                placeholder="e.g., Action, Adventure, Sci-Fi"
                placeholderTextColor="#6b7280"
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Directors (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={formData.directors?.join(', ')}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  directors: text.split(',').map(d => d.trim()).filter(d => d) 
                })}
                placeholder="e.g., John Doe, Jane Smith"
                placeholderTextColor="#6b7280"
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Languages (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={formData.languages?.join(', ')}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  languages: text.split(',').map(l => l.trim()).filter(l => l) 
                })}
                placeholder="e.g., English, Spanish"
                placeholderTextColor="#6b7280"
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Countries (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={formData.countries?.join(', ')}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  countries: text.split(',').map(c => c.trim()).filter(c => c) 
                })}
                placeholder="e.g., USA, Canada"
                placeholderTextColor="#6b7280"
                editable={!isSaving}
              />
            </View>
          </View>
        </ScrollView>
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
  },
  formContainer: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  input: {
    backgroundColor: '#1e2127',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3d434d',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  largeTextArea: {
    minHeight: 150,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 16,
    fontSize: 16,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '500',
  },
  saveButton: {
    minWidth: 50,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});