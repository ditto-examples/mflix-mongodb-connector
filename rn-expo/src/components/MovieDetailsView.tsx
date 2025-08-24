import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Movie } from '../models/movie';

interface MovieDetailsViewProps {
  movie: Movie;
}

export const MovieDetailsView: React.FC<MovieDetailsViewProps> = ({ movie }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plot</Text>
        <Text style={styles.plot}>{movie.plot}</Text>
      </View>

      {movie.fullplot && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Plot</Text>
          <Text style={styles.plot}>{movie.fullplot}</Text>
        </View>
      )}

      {movie.directors && movie.directors.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Directors:</Text>
          <Text style={styles.value}>{movie.directors.join(', ')}</Text>
        </View>
      )}

      {movie.cast && movie.cast.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Cast:</Text>
          <Text style={styles.value}>{movie.cast.slice(0, 5).join(', ')}</Text>
        </View>
      )}

      {movie.languages && movie.languages.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Languages:</Text>
          <Text style={styles.value}>{movie.languages.join(', ')}</Text>
        </View>
      )}

      {movie.countries && movie.countries.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Countries:</Text>
          <Text style={styles.value}>{movie.countries.join(', ')}</Text>
        </View>
      )}

      {movie.runtime > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Runtime:</Text>
          <Text style={styles.value}>{movie.runtime} minutes</Text>
        </View>
      )}

      {movie.imdb && movie.imdb['rating'] && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>IMDB Rating:</Text>
          <Text style={styles.value}>
            {movie.imdb['rating']} ({movie.imdb['votes'] || 'no'} votes)
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  plot: {
    fontSize: 16,
    color: '#9ea3b0',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginRight: 8,
  },
  value: {
    fontSize: 16,
    color: '#9ea3b0',
    flex: 1,
  },
});