import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EpisodeGrid } from '@/components/EpisodeGrid';
import { Icon } from '@/components/Icon';
import { BadgeTag, Poster } from '@/components/Poster';
import { colors, gradients, spacing } from '@/constants/theme';
import { usePlayback } from '@/context/Playback';
import { getGenreCategory, getSeries, seriesList } from '@/data/catalog';
import { openCategory, openEpisode, openSearch, openSeries, resumeEpisode } from '@/lib/nav';
import { formatCount } from '@/lib/time';

export default function SeriesScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const show = getSeries(id ?? '');
  const { getProgress, isSaved, toggleSaved } = usePlayback();
  const [expanded, setExpanded] = useState(false);

  if (!show) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.missingText}>Series not found</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const progress = getProgress(show.id);
  const start = resumeEpisode(show, progress);
  const started = Boolean(progress);
  const saved = isSaved(show.id);
  const genreCategory = getGenreCategory(show.genre);
  const related = [
    ...seriesList.filter((item) => item.id !== show.id && item.genre === show.genre),
    ...seriesList.filter((item) => item.id !== show.id && item.genre !== show.genre),
  ].slice(0, 6);
  const backdropHeight = width * 0.95;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}>
        <View style={{ height: backdropHeight }}>
          <Image
            source={{ uri: show.poster }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            blurRadius={18}
          />
          <LinearGradient
            colors={['rgba(8,8,12,0.25)', 'rgba(8,8,12,0.7)', colors.bg]}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.headline, { paddingTop: insets.top + 56 }]}>
            <Poster
              show={show}
              showBadge={false}
              showMeta={false}
              style={styles.cover}
              radius={12}
            />
            <View style={styles.headlineCopy}>
              {show.badge ? <BadgeTag badge={show.badge} style={styles.badge} /> : null}
              <Text style={styles.title}>{show.title}</Text>
              <View style={styles.stats}>
                <Stat icon="star" color={colors.gold} label={show.rating.toFixed(1)} />
                <Stat icon="eye" label={formatCount(show.views)} />
                <Stat icon="heartFill" color={colors.accent} label={formatCount(show.likes)} />
              </View>
              <Text style={styles.metaLine}>
                {show.genre} · {show.episodes.length} episodes · Complete
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.tags}>
            {genreCategory ? (
              <Pressable onPress={() => openCategory(genreCategory.id)}>
                <Text style={[styles.tag, styles.genreTag]}>{show.genre}</Text>
              </Pressable>
            ) : null}
            {show.tags.map((tag) => (
              <Pressable key={tag} onPress={() => openSearch(tag)}>
                <Text style={styles.tag}>#{tag}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => setExpanded((value) => !value)}>
            <Text style={styles.synopsis} numberOfLines={expanded ? undefined : 3}>
              {show.synopsis}
            </Text>
            <Text style={styles.more}>{expanded ? 'Less' : 'More'}</Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable
              onPress={() => openEpisode(show.id, start.id)}
              style={({ pressed }) => [styles.playWrap, pressed && styles.pressed]}>
              <LinearGradient
                colors={gradients.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.play}>
                <Icon name="play" size={18} color={colors.onAccent} />
                <Text style={styles.playText}>
                  {started ? `Continue ep. ${start.number}` : 'Play episode 1'}
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={() => toggleSaved(show.id)}
              style={({ pressed }) => [styles.save, pressed && styles.pressed]}>
              <Icon
                name={saved ? 'bookmarkFill' : 'bookmark'}
                size={20}
                color={saved ? colors.gold : colors.text}
              />
              <Text style={styles.saveText}>{saved ? 'Saved' : 'My list'}</Text>
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Episodes</Text>
            <Text style={styles.sectionMeta}>{show.episodes.length} episodes · All available</Text>
          </View>
          <EpisodeGrid
            show={show}
            currentNumber={started ? start.number : undefined}
            onSelect={(episode) => openEpisode(show.id, episode.id)}
          />

          <Text style={[styles.sectionTitle, styles.relatedTitle]}>You might also like</Text>
        </View>

        <FlatList
          data={related}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.relatedRow}
          ItemSeparatorComponent={() => <View style={{ width: spacing.gap }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openSeries(item.id)}
              style={({ pressed }) => [styles.relatedCard, pressed && styles.pressed]}>
              <Poster show={item} style={styles.relatedPoster} />
              <Text style={styles.relatedName} numberOfLines={1}>
                {item.title}
              </Text>
            </Pressable>
          )}
        />
      </ScrollView>

      <Pressable
        onPress={goBack}
        hitSlop={10}
        style={[styles.back, { top: insets.top + 8 }]}>
        <Icon name="back" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

function Stat({
  icon,
  label,
  color = colors.text,
}: {
  icon: 'star' | 'eye' | 'heartFill';
  label: string;
  color?: string;
}) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={13} color={color} />
      <Text style={styles.statText}>{label}</Text>
    </View>
  );
}

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  back: {
    position: 'absolute',
    left: spacing.screen,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    paddingHorizontal: spacing.screen,
    paddingBottom: 6,
  },
  cover: {
    width: 128,
    height: 180,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headlineCopy: {
    flex: 1,
    alignItems: 'flex-start',
  },
  badge: {
    position: 'relative',
    borderRadius: 6,
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  metaLine: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingTop: 14,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    color: colors.muted,
    backgroundColor: colors.card,
    fontSize: 12,
    fontWeight: '600',
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  genreTag: {
    color: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  synopsis: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },
  more: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  playWrap: {
    flex: 1,
  },
  play: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 14,
  },
  playText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '800',
  },
  save: {
    alignItems: 'center',
    gap: 2,
    minWidth: 64,
  },
  saveText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  sectionMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  relatedTitle: {
    marginTop: 28,
    marginBottom: 12,
  },
  relatedRow: {
    paddingHorizontal: spacing.screen,
  },
  relatedCard: {
    width: 110,
  },
  relatedPoster: {
    width: 110,
    height: 156,
  },
  relatedName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  missing: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    gap: 12,
  },
  missingText: {
    color: colors.text,
    fontSize: 18,
  },
  link: {
    color: colors.accent,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});
