import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SyncStatusInfo } from '../models/syncStatusInfo';

interface SyncStatusItemProps {
    status: SyncStatusInfo;
}

export const SyncStatusItem = ({ status }: SyncStatusItemProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.peerType}>{status.peerType}</Text>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: status.statusColor }]} />
                    <Text style={styles.statusText}>{status.syncSessionStatus}</Text>
                </View>
            </View>
            <Text style={styles.peerId} numberOfLines={2}>{status.id}</Text>
            <View style={styles.infoRow}>
                <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color="#32d74b" 
                    style={styles.icon}
                />
                <Text style={styles.infoText}>{status.formattedCommitId}</Text>
            </View>
            <View style={styles.infoRow}>
                <Ionicons 
                    name="time-outline" 
                    size={16} 
                    color="#8e8e93" 
                    style={styles.icon}
                />
                <Text style={styles.infoText}>Last update: {status.formattedLastUpdate}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#25292e',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#3d3d3d',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    peerType: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 15,
        color: '#8e8e93',
    },
    peerId: {
        fontSize: 13,
        color: '#8e8e93',
        marginBottom: 8,
        fontFamily: 'monospace',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    icon: {
        marginRight: 6,
    },
    infoText: {
        fontSize: 13,
        color: '#8e8e93',
        flex: 1,
    },
});