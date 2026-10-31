import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: true }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to series</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.bg,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    color: colors.accent,
    fontSize: 16,
  },
});
