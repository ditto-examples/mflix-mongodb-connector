import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IndexInfo } from '../models/indexInfo';

interface IndexItemProps {
    index: IndexInfo;
}

export const IndexItem = ({ index }: IndexItemProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{index.id}</Text>
                    <Ionicons name="document-text-outline" size={20} color="#007AFF" />
                </View>
                <Text style={styles.collection}>Collection: {index.collection}</Text>
                <View style={styles.fieldsContainer}>
                    <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color="#32d74b" 
                        style={styles.checkIcon}
                    />
                    <Text style={styles.fields}>Fields: {index.formattedFields}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1e2127',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 10,
        overflow: 'hidden',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
    collection: {
        fontSize: 15,
        color: '#8e8e93',
        marginBottom: 8,
    },
    fieldsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkIcon: {
        marginRight: 6,
    },
    fields: {
        fontSize: 15,
        color: '#8e8e93',
        flex: 1,
    },
});