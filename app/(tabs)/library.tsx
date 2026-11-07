import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanionButton } from '@/components/CompanionButton';
import { Icon } from '@/components/Icon';
import { Poster } from '@/components/Poster';
import { colors, spacing } from '@/constants/theme';
import { usePlayback } from '@/context/Playback';
import { getSeries } from '@/data/catalog';
import { openEpisode, openSeries, resumeEpisode } from '@/lib/nav';

type Tab = 'history' | 'saved';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { entries, saved } = usePlayback();
  const [tab, setTab] = useState<Tab>('history');
  const history = entries.flatMap((entry) => {
    const show = getSeries(entry.seriesId);
    return show ? [{ show, episode: resumeEpisode(show, entry) }] : [];
  });
  const savedShows = saved.flatMap((id) => {
    const show = getSeries(id);
    return show ? [show] : [];
  });
  const gridWidth = (width - spacing.screen * 2 - spacing.gap * 2) / 3;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 100 }}>
        <Text style={styles.title}>Library</Text>

        <View style={styles.segment}>
          <SegmentButton
            label={`Continue watching${history.length ? ` · ${history.length}` : ''}`}
            selected={tab === 'history'}
            onPress={() => setTab('history')}
          />
          <SegmentButton
            label={`My list${savedShows.length ? ` · ${savedShows.length}` : ''}`}
            selected={tab === 'saved'}
            onPress={() => setTab('saved')}
          />
        </View>

        {tab === 'history' ? (
          history.length === 0 ? (
            <Empty
              title="You haven't started anything yet"
              body="Start an episode and it will show up here, so you can pick up right where you left off."
            />
          ) : (
            history.map(({ show, episode }) => {
              const ratio = episode.number / show.episodes.length;
              return (
                <Pressable
                  key={show.id}
                  onPress={() => openEpisode(show.id, episode.id)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <Poster show={show} showBadge={false} showMeta={false} style={styles.thumb} radius={8} />
                  <View style={styles.copy}>
                    <Text style={styles.showTitle} numberOfLines={1}>
                      {show.title}
                    </Text>
                    <Text style={styles.episodeLine}>
                      Episode {episode.number} of {show.episodes.length}
                    </Text>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
                    </View>
                    <Text style={styles.percent}>{Math.round(ratio * 100)}% of series</Text>
                  </View>
                  <View style={styles.playButton}>
                    <Icon name="play" size={16} color={colors.onAccent} />
                  </View>
                </Pressable>
              );
            })
          )
        ) : savedShows.length === 0 ? (
          <Empty
            title="Your list is empty"
            body="Tap the save icon on a series or in the player and it will appear here."
          />
        ) : (
          <View style={styles.grid}>
            {savedShows.map((show) => (
              <Pressable
                key={show.id}
                onPress={() => openSeries(show.id)}
                style={({ pressed }) => [{ width: gridWidth }, pressed && styles.pressed]}>
                <Poster show={show} style={{ width: gridWidth, height: gridWidth * 1.42 }} />
                <Text style={styles.gridTitle} numberOfLines={1}>
                  {show.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <CompanionButton />
    </View>
  );
}

function SegmentButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.segmentButton, selected && styles.segmentSelected]}>
      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Icon name="sparkles" size={30} color={colors.accent} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      <Pressable onPress={() => router.navigate('/foryou')} style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>Discover series</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    paddingHorizontal: spacing.screen,
  },
  segment: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    marginTop: 14,
    marginBottom: 18,
    backgroundColor: colors.bgRaised,
    borderRadius: 999,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 9,
  },
  segmentSelected: {
    backgroundColor: colors.card,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  segmentTextSelected: {
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing.screen,
    marginBottom: 14,
    backgroundColor: colors.bgRaised,
    borderRadius: 12,
    padding: 10,
  },
  thumb: {
    width: 72,
    height: 100,
  },
  copy: {
    flex: 1,
  },
  showTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  episodeLine: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginTop: 10,
    flexDirection: 'row',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  percent: {
    color: colors.faint,
    fontSize: 11,
    marginTop: 5,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    paddingHorizontal: spacing.screen,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.gap,
    rowGap: 16,
  },
  gridTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  empty: {
    alignItems: 'center',
    marginHorizontal: spacing.screen * 2,
    marginTop: 48,
    gap: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  emptyButtonText: {
    color: colors.onAccent,
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});
