import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors, gradients } from '@/constants/theme';
import type { Badge, Series } from '@/data/catalog';
import { formatCount } from '@/lib/time';

type PosterProps = {
  show: Series;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  showBadge?: boolean;
  showMeta?: boolean;
  fade?: boolean;
  children?: ReactNode;
};

const badgeColors: Record<Badge, readonly [string, string]> = {
  Hot: gradients.accent,
  New: ['#7B5CFF', '#4B2FD6'],
  Exclusive: ['#FFC34D', '#E58A1F'],
};

export function Poster({
  show,
  style,
  radius = 10,
  showBadge = true,
  showMeta = true,
  fade = true,
  children,
}: PosterProps) {
  return (
    <View style={[styles.poster, { borderRadius: radius, backgroundColor: show.accent }, style]}>
      <Image source={{ uri: show.poster }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      {fade ? (
        <LinearGradient
          colors={gradients.posterFade}
          locations={[0.45, 0.72, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {showBadge && show.badge ? <BadgeTag badge={show.badge} /> : null}
      {showMeta ? (
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Icon name="eye" size={11} color={colors.text} />
            <Text style={styles.metaText}>{formatCount(show.views)}</Text>
          </View>
          <Text style={styles.metaText}>{show.episodes.length} eps</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function BadgeTag({ badge, style }: { badge: Badge; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient
      colors={badgeColors[badge]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badge, style]}>
      <Text style={[styles.badgeText, badge === 'Exclusive' && styles.badgeTextDark]}>{badge}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  poster: {
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  badgeText: {
    color: colors.onAccent,
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextDark: {
    color: '#2A1A00',
  },
  meta: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
  },
});
