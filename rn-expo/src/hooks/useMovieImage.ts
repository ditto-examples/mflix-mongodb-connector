import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Asset } from 'expo-asset';

/**
 * A custom hook that manages movie poster images with fallback to a default image.
 * This hook handles loading and displaying movie posters, with platform-specific
 * fallback behavior when no poster is available.
 * 
 * @param {string} [poster] - Optional URL of the movie poster image
 * 
 * @returns {Object} An object containing:
 * - imageSource: The image source object for the poster or default image
 * - isLoading: Boolean indicating if the default image is being loaded
 * - setIsLoading: Function to manually set the loading state
 * 
 * @remarks
 * - If a valid poster URL is provided, it will be used as the image source
 * - On Android, falls back to a bundled default image
 * - On iOS, loads the default image as an Asset and uses its local URI
 * - The default image is loaded asynchronously when the hook mounts
 * 
 */
export const useMovieImage = (poster?: string) => {
    const [defaultImage, setDefaultImage] = useState<Asset | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Asset.loadAsync(require('../../assets/images/default.png'))
            .then(([asset]) => setDefaultImage(asset))
            .catch(error => console.error('Error loading default image:', error));
    }, []);

    const getImageSource = () => {
        if (poster && typeof poster === 'string' && poster.trim() !== '') {
            return { uri: poster };
        }
        if (Platform.OS === 'android') {
            return require('../../assets/images/default.png');
        }
        if (defaultImage?.localUri) {
            return { uri: defaultImage.localUri };
        }
        return null;
    };

    return {
        imageSource: getImageSource(),
        isLoading,
        setIsLoading
    };
}; 