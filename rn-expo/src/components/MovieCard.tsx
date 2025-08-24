import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Asset } from 'expo-asset';
import { MovieListing } from '../models/movieListing';
import { useEffect, useState } from 'react';
import { useMovieImage } from '../hooks/useMovieImage';

/**
 * Props for the MovieCard component
 */
interface MovieCardProps {
    movie: MovieListing;
    onPress?: () => void;
}

/**
 * A reusable card component that displays movie information including:
 * - Movie poster image with loading state
 * - Movie title
 * - Release year
 * - Plot summary
 * 
 * @component
 * @param {MovieCardProps} props - The props for the MovieCard component
 * @param {Movie} props.movie - The movie object to display
 * @param {Function} [props.onPress] - Optional callback when the card is pressed
 * 
 * @example
 * <MovieCard
 *   movie={movie}
 *   onPress={() => navigation.navigate('MovieDetails', { id: movie.id })}
 * />
 * 
 * @remarks
 * - Uses useMovieImage hook for poster image loading and fallback
 * - Implements a press animation effect
 * - Handles loading states for the poster image
 * - Truncates plot text to 3 lines
 * - Uses platform-specific shadows and elevation
 */
export function MovieCard({ movie, onPress }: MovieCardProps) {
    const { imageSource, isLoading, setIsLoading } = useMovieImage(movie.poster);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                {
                    transform: [{ scale: pressed ? 0.875 : 1 }],
                }
            ]}
            onPress={onPress}
        >
           <View style={styles.imageContainer}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                )}
                <Image
                    style={styles.image}
                    source={imageSource}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    contentFit="cover"
                    transition={1000}
                    cachePolicy="memory-disk"
                />
            </View>
            <View style={styles.header}>
                <Text style={styles.title}>{movie.title}</Text>
                <Text style={styles.year}>{movie.year}</Text>
            </View>
            <View style={styles.footer}>
                <Text 
                    style={styles.plot}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                >
                    {movie.plot}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#2c313a',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        marginHorizontal: 2,
        borderColor: '#3d434d',
        borderWidth: 1,
    },
    header: {
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    year: {
        fontSize: 14,
        color: '#9ea3b0',
    },
    imageContainer: {
        height: 200,
        position: 'relative',
        backgroundColor: '#1e2127',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        zIndex: 1,
    },
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    footer: {
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 16, 
    },
    plot: {
        fontSize: 14,
        color: '#9ea3b0',
        lineHeight: 20,
    },
});
