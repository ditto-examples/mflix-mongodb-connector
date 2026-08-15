import {
  DiskUsage,
  PeersList,
  QueryEditor,
  SystemSettings,
} from '@dittolive/ditto-react-native-tools';
import { Stack } from 'expo-router';
import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DittoContext from '../../src/providers/DittoContext';

type Tool = 'peers' | 'disk' | 'query' | 'settings';

const tools: Array<{ id: Tool; label: string }> = [
  { id: 'peers', label: 'Peers' },
  { id: 'disk', label: 'Disk Usage' },
  { id: 'query', label: 'Query Editor' },
  { id: 'settings', label: 'Settings' },
];

export default function ToolsTab() {
  const [selectedTool, setSelectedTool] = useState<Tool>('peers');
  const ditto = useContext(DittoContext)?.dittoService.ditto;

  const renderTool = () => {
    if (!ditto) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      );
    }

    switch (selectedTool) {
      case 'peers':
        return (
          <PeersList
            ditto={ditto}
            showConnectionDetails
            style={styles.tool}
          />
        );
      case 'disk':
        return <DiskUsage ditto={ditto} style={styles.tool} />;
      case 'query':
        return (
          <QueryEditor
            ditto={ditto}
            style={{ container: styles.tool }}
          />
        );
      case 'settings':
        return <SystemSettings ditto={ditto} style={styles.tool} />;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ditto Tools' }} />
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.toolSelector}
          contentContainerStyle={styles.toolSelectorContent}
        >
          {tools.map((tool) => (
            <Pressable
              key={tool.id}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedTool === tool.id }}
              onPress={() => setSelectedTool(tool.id)}
              style={[
                styles.toolButton,
                selectedTool === tool.id && styles.toolButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.toolButtonText,
                  selectedTool === tool.id && styles.toolButtonTextSelected,
                ]}
              >
                {tool.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.toolContainer}>{renderTool()}</View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  toolSelector: {
    flexGrow: 0,
    borderBottomColor: '#3d3d3d',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolSelectorContent: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toolButton: {
    backgroundColor: '#1e2127',
    borderColor: '#3d434d',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toolButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  toolButtonText: {
    color: '#9ea3b0',
    fontSize: 14,
    fontWeight: '600',
  },
  toolButtonTextSelected: {
    color: '#fff',
  },
  toolContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tool: {
    flex: 1,
  },
});
