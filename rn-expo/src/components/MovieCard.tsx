import { Card, H2, Paragraph, YStack, Spinner } from 'tamagui';
import { Image } from 'expo-image';
import { Movie } from '../models/movie';

const defaultImage = require('../assets/images/default.png') as number;

interface MovieCardProps {
    movie: Movie;
    onPress?: () => void;
}

export function MovieCard({ movie, onPress }: MovieCardProps) {
    return (
        <Card
            elevate
            size="$4"
            bordered
            animation="bouncy"
            scale={0.9}
            hoverStyle={{ scale: 0.925 }}
            pressStyle={{ scale: 0.875 }}
            onPress={onPress}
            backgroundColor="#25292e"
        >
            <Card.Header padded>
                <H2 color="#fff">{movie.title}</H2>
                <Paragraph theme="alt2" color="#fff">{movie.year}</Paragraph>
            </Card.Header>

            <YStack height={200}>
                <Image
                    style={{ flex: 1, width: '100%', height: '100%' }}
                    source={movie.poster ? { uri: movie.poster } : defaultImage}
                    placeholder={<Spinner size="large" color="#fff" />}
                    contentFit="cover"
                    transition={1000}
                    cachePolicy="memory-disk"
                />
            </YStack>

            <Card.Footer padded>
                <Paragraph 
                    color="#fff" 
                    numberOfLines={3}
                    ellipsizeMode="tail"
                >
                    {movie.plot}
                </Paragraph>
            </Card.Footer>
        </Card>
    );
}
