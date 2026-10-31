import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import type { Category } from '@/data/catalog';
import { openCategory } from '@/lib/nav';
import { seriesCount } from '@/lib/time';

type CategoryTileProps = {
  category: Category;
  style?: StyleProp<ViewStyle>;
};

export function CategoryTile({ category, style }: CategoryTileProps) {
  const cover = category.series[0];

  return (
    <Pressable
      onPress={() => openCategory(category.id)}
      style={({ pressed }) => [styles.tile, { backgroundColor: category.accent }, style, pressed && styles.pressed]}>
      {cover ? (
        <Image source={{ uri: cover.poster }} style={styles.cover} resizeMode="cover" />
      ) : null}
      <LinearGradient
        colors={[`${category.accent}F2`, `${category.accent}99`, 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>
        <Text style={styles.count}>{seriesCount(category.series.length)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 84,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cover: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '55%',
    transform: [{ rotate: '8deg' }, { scale: 1.25 }],
  },
  copy: {
    position: 'absolute',
    top: 12,
    right: 12,
    left: 12,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  count: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  pressed: {
    opacity: 0.8,
  },
});
