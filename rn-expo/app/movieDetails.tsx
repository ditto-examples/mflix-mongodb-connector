import { View, StyleSheet, ActivityIndicator, Pressable, Text, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMovie } from '../src/hooks/useMovie';
import { useMovieImage } from '../src/hooks/useMovieImage';
import { useComments } from '../src/hooks/useComments';
import { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MovieDetailsView } from '../src/components/MovieDetailsView';
import { CommentsView } from '../src/components/CommentsView';

export default function MovieDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { movie, isLoading: isLoadingMovie, error } = useMovie(id);
  const { imageSource, isLoading: isLoadingImage, setIsLoading: setIsLoadingImage } = useMovieImage(movie?.poster);
  const { comments, isLoading: isLoadingComments, error: commentsError, addComment } = useComments(id);
  const [selectedTab, setSelectedTab] = useState<'details' | 'comments'>('details');

  const commentCount = useMemo(() => comments.length, [comments]);

  return (
    <>
      <Stack.Screen 
        options={{
          title: Platform.OS === 'android' ? '' : movie?.title || 'Movie',
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            color: '#fff',
          },
          headerBackTitle: 'Movies',
          headerLeft: () => (
            <Pressable
              style={[styles.backButton, Platform.OS === 'android' && styles.backButtonAndroid]}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
              <Text style={styles.backText}>Movies</Text>
            </Pressable>
          ),
          headerRight: () => (
            selectedTab === 'details' ? (
              <Pressable
                style={styles.editButton}
                onPress={() => router.push({
                  pathname: '/editMovie',
                  params: { id: movie?.id }
                })}
              >
                <Ionicons name="create-outline" size={24} color="#007AFF" />
              </Pressable>
            ) : null
          ),
        }} 
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {isLoadingMovie ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : movie ? (
          <>
            <View style={styles.imageContainer}>
              {isLoadingImage && (
                <View style={styles.imageLoadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              <Image
                source={imageSource}
                style={styles.poster}
                contentFit="cover"
                onLoadStart={() => setIsLoadingImage(true)}
                onLoadEnd={() => setIsLoadingImage(false)}
                transition={300}
                cachePolicy="memory-disk"
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                placeholderContentFit="cover"
              />
            </View>

            <View style={styles.movieInfo}>
              <Text style={styles.title}>{movie.title}</Text>
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#9ea3b0" />
                  <Text style={styles.metaText}>{movie.year}</Text>
                </View>
                {movie.rated && (
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.metaText}>{movie.rated}</Text>
                  </View>
                )}
              </View>
              {movie.genres && movie.genres.length > 0 && (
                <Text style={styles.genres}>Genres: {movie.genres.join(', ')}</Text>
              )}
            </View>

            <View style={styles.segmentControl}>
              <Pressable
                style={[
                  styles.segmentButton,
                  selectedTab === 'details' && styles.segmentButtonActive
                ]}
                onPress={() => setSelectedTab('details')}
              >
                <Text style={[
                  styles.segmentText,
                  selectedTab === 'details' && styles.segmentTextActive
                ]}>
                  Details
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segmentButton,
                  selectedTab === 'comments' && styles.segmentButtonActive
                ]}
                onPress={() => setSelectedTab('comments')}
              >
                <Text style={[
                  styles.segmentText,
                  selectedTab === 'comments' && styles.segmentTextActive
                ]}>
                  Comments ({commentCount})
                </Text>
              </Pressable>
            </View>

            <View style={styles.contentContainer}>
              {selectedTab === 'details' ? (
                <MovieDetailsView movie={movie} />
              ) : (
                <CommentsView
                  comments={comments}
                  isLoading={isLoadingComments}
                  error={commentsError}
                  onAddComment={addComment}
                />
              )}
            </View>
          </>
        ) : null}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 250,
    width: '100%',
    backgroundColor: '#1e2127',
    position: 'relative',
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: 250,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e2127',
    zIndex: 1,
  },
  movieInfo: {
    padding: 16,
    backgroundColor: '#25292e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#9ea3b0',
  },
  genres: {
    fontSize: 14,
    color: '#9ea3b0',
  },
  segmentControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#1e2127',
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#3d434d',
  },
  segmentText: {
    fontSize: 16,
    color: '#9ea3b0',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    marginTop: 8,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 16,
    fontSize: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  backButtonAndroid: {
    paddingLeft: 4,
    marginLeft: -16,
  },
  backText: {
    color: '#007AFF',
    fontSize: 17,
    marginLeft: 4,
  },
  editButton: {
    paddingRight: 16,
  },
});