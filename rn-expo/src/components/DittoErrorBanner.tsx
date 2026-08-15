import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DittoContext from '../providers/DittoContext';

/**
 * Shows Ditto failures that the screens cannot report themselves.
 *
 * Startup failures and authentication failures both leave the app running with
 * no data and no sync, which is indistinguishable from "still syncing" unless
 * the reason is shown. The banner sits above the navigator, so it needs to
 * account for the status bar inset itself - the app runs edge-to-edge on
 * Android.
 */
export function DittoErrorBanner() {
  const context = useContext(DittoContext);
  const insets = useSafeAreaInsets();

  const error = context?.error ?? context?.authError;
  if (!error) {
    return null;
  }

  const isAuthError = !context?.error;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.title}>
        {isAuthError ? 'Ditto is not authenticated' : 'Ditto failed to start'}
      </Text>
      <Text style={styles.message}>{error.message}</Text>
      <Text style={styles.hint}>
        Check the Database ID, Online Playground Token, and Server URL in
        src/services/dittoService.ts against your Ditto Portal connection
        details.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  message: {
    color: '#fecaca',
    fontSize: 13,
    marginTop: 4,
  },
  hint: {
    color: '#fecaca',
    fontSize: 12,
    marginTop: 6,
  },
});

export default DittoErrorBanner;
