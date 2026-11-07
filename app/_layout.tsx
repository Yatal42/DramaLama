import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { PlaybackProvider } from '@/context/Playback';
import { WalletProvider } from '@/context/Wallet';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <View style={styles.shell}>
      <View style={styles.frame}>
        <PlaybackProvider>
          <WalletProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
              }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="series/[id]" />
              <Stack.Screen name="search" options={{ animation: 'fade' }} />
              <Stack.Screen name="category/[id]" />
              <Stack.Screen
                name="watch/[seriesId]/[episodeId]"
                options={{ animation: 'fade', gestureEnabled: false }}
              />
              <Stack.Screen name="companion" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="store" />
            </Stack>
          </WalletProvider>
        </PlaybackProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#05040A',
    alignItems: 'center',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    height: '100%',
    backgroundColor: colors.bg,
  },
});
