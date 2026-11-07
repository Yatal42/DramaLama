import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors, gradients } from '@/constants/theme';

export function CompanionAvatar({ size = 56 }: { size?: number }) {
  return (
    <LinearGradient
      colors={gradients.accent}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>L</Text>
      <View style={[styles.spark, { right: size * 0.04, top: size * 0.04 }]}>
        <Icon name="sparkles" size={size * 0.26} color={colors.gold} />
      </View>
    </LinearGradient>
  );
}

export function CompanionButton() {
  return (
    <Pressable
      accessibilityLabel="Open Lama, your companion"
      onPress={() => router.push('/companion')}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <CompanionAvatar />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: colors.onAccent,
    fontWeight: '900',
  },
  spark: {
    position: 'absolute',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
});
