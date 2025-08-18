import { Text, View, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { useIndexes } from '../../src/hooks/useIndexes';
import { useSyncStatus } from '../../src/hooks/useSyncStatus';
import { IndexItem } from '../../src/components/IndexItem';
import { SyncStatusItem } from '../../src/components/SyncStatusItem';
import { IndexInfo } from '../../src/models/indexInfo';
import { SyncStatusInfo } from '../../src/models/syncStatusInfo';

type SystemSection = 'sync' | 'indexes';

export default function SystemTab() {
  const [selectedSection, setSelectedSection] = useState<SystemSection>('sync');
  const { indexes, isLoading: indexesLoading, error: indexesError, refresh: refreshIndexes } = useIndexes();
  const { syncStatuses, isLoading: syncLoading, error: syncError } = useSyncStatus();

  const renderIndexItem = ({ item }: { item: IndexInfo }) => (
    <IndexItem index={item} />
  );

  const renderSyncStatusItem = ({ item }: { item: SyncStatusInfo }) => (
    <SyncStatusItem status={item} />
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'sync':
        if (syncLoading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          );
        }
        
        if (syncError) {
          return (
            <View style={styles.contentContainer}>
              <Text style={styles.errorText}>{syncError}</Text>
            </View>
          );
        }

        if (syncStatuses.length === 0) {
          return (
            <View style={styles.contentContainer}>
              <Text style={styles.emptyText}>No sync connections found</Text>
            </View>
          );
        }

        return (
          <FlatList
            data={syncStatuses}
            renderItem={renderSyncStatusItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <Text style={styles.sectionHeader}>Connected Peers</Text>
            )}
          />
        );
      case 'indexes':
        if (indexesLoading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          );
        }
        
        if (indexesError) {
          return (
            <View style={styles.contentContainer}>
              <Text style={styles.errorText}>{indexesError}</Text>
            </View>
          );
        }

        if (indexes.length === 0) {
          return (
            <View style={styles.contentContainer}>
              <Text style={styles.emptyText}>No indexes found</Text>
            </View>
          );
        }

        return (
          <FlatList
            data={indexes}
            renderItem={renderIndexItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={refreshIndexes}
            refreshing={indexesLoading}
            ListHeaderComponent={() => (
              <Text style={styles.sectionHeader}>Local Database Indexes</Text>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'System',
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            color: '#fff',
          },
        }} 
      />
      <View style={styles.container}>
        <View style={styles.segmentContainer}>
          <View style={styles.segmentControl}>
            <Pressable
              style={[
                styles.segmentButton,
                selectedSection === 'sync' && styles.segmentButtonActive,
                styles.segmentButtonLeft,
              ]}
              onPress={() => setSelectedSection('sync')}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedSection === 'sync' && styles.segmentTextActive,
                ]}
              >
                Sync Status
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.segmentButton,
                selectedSection === 'indexes' && styles.segmentButtonActive,
                styles.segmentButtonRight,
              ]}
              onPress={() => setSelectedSection('indexes')}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedSection === 'indexes' && styles.segmentTextActive,
                ]}
              >
                Indexes
              </Text>
            </Pressable>
          </View>
        </View>
        {renderContent()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  segmentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#25292e',
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 9,
    padding: 2,
    height: 32,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  segmentButtonLeft: {
  },
  segmentButtonRight: {
  },
  segmentButtonActive: {
    backgroundColor: '#3a3a3c',
  },
  segmentText: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  contentText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
  },
  emptyText: {
    color: '#8e8e93',
    fontSize: 16,
  },
  sectionHeader: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
});