import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EpisodeSheet } from '@/components/EpisodeSheet';
import { Icon } from '@/components/Icon';
import { Poster } from '@/components/Poster';
import { ShortPage } from '@/components/ShortPlayer';
import { colors } from '@/constants/theme';
import { usePlayback } from '@/context/Playback';
import { getSeries, type Episode, type Series } from '@/data/catalog';

const speeds = [1, 1.25, 1.5, 2];

export default function WatchScreen() {
  const params = useLocalSearchParams<{ seriesId: string; episodeId: string }>();
  const show = getSeries(params.seriesId ?? '');

  if (!show) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Episode not found</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.accentText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return <SeriesPlayer show={show} episodeId={params.episodeId ?? ''} />;
}

function SeriesPlayer({ show, episodeId }: { show: Series; episodeId: string }) {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const { getProgress } = usePlayback();
  const listRef = useRef<FlatList<Episode>>(null);
  const initialIndex = Math.max(
    0,
    show.episodes.findIndex((item) => item.id === episodeId),
  );
  const [initialStart] = useState(() => {
    const saved = getProgress(show.id);
    return saved && saved.episodeId === show.episodes[initialIndex].id ? saved.positionSec : 0;
  });
  const [height, setHeight] = useState(0);
  const [index, setIndex] = useState(initialIndex);
  const [sheet, setSheet] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [finished, setFinished] = useState(false);
  const current = show.episodes[index];

  function jumpTo(target: number, animated: boolean) {
    setFinished(false);
    setIndex(target);
    listRef.current?.scrollToIndex({ index: target, animated });
  }

  return (
    <View style={styles.screen} onLayout={(event) => setHeight(event.nativeEvent.layout.height)}>
      {height > 0 ? (
        <FlatList
          ref={listRef}
          data={show.episodes}
          extraData={`${index}-${focused}-${sheet}-${finished}-${speed}`}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          initialScrollIndex={initialIndex}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          getItemLayout={(_, itemIndex) => ({ length: height, offset: height * itemIndex, index: itemIndex })}
          onMomentumScrollEnd={(event) => {
            const next = Math.round(event.nativeEvent.contentOffset.y / height);
            if (next !== index) {
              setFinished(false);
              setIndex(next);
            }
          }}
          renderItem={({ item, index: itemIndex }) => (
            <ShortPage
              show={show}
              episode={item}
              height={height}
              near={Math.abs(itemIndex - index) <= 1}
              active={focused && !sheet && !finished && itemIndex === index}
              startAt={itemIndex === initialIndex ? initialStart : 0}
              playbackRate={speed}
              trackProgress
              bottomInset={insets.bottom}
              onEpisodes={() => setSheet(true)}
              onEnded={() => {
                if (itemIndex !== index) return;
                if (itemIndex + 1 < show.episodes.length) {
                  jumpTo(itemIndex + 1, true);
                } else {
                  setFinished(true);
                }
              }}
              info={<EpisodeInfo show={show} episode={item} onOpenSheet={() => setSheet(true)} />}
            />
          )}
        />
      ) : null}

      <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={goBack} hitSlop={10} style={styles.topButton}>
          <Icon name="back" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.topCopy}>
          <Text style={styles.topTitle} numberOfLines={1}>
            {show.title}
          </Text>
          <Text style={styles.topMeta}>
            Episode {current.number} of {show.episodes.length}
          </Text>
        </View>
        <Pressable
          onPress={() => setSpeed(speeds[(speeds.indexOf(speed) + 1) % speeds.length])}
          style={styles.speed}>
          <Text style={styles.speedText}>{speed}x</Text>
        </Pressable>
      </View>

      {finished ? (
        <View style={styles.finale}>
          <Poster show={show} showBadge={false} showMeta={false} style={styles.finalePoster} />
          <Text style={styles.finaleTitle}>You finished {show.title}</Text>
          <Text style={styles.finaleBody}>All {show.episodes.length} episodes watched</Text>
          <Pressable onPress={() => jumpTo(0, false)} style={styles.finaleButton}>
            <Text style={styles.finaleButtonText}>Watch again from the start</Text>
          </Pressable>
          <Pressable onPress={goBack}>
            <Text style={styles.accentText}>Go back</Text>
          </Pressable>
        </View>
      ) : null}

      <EpisodeSheet
        show={show}
        visible={sheet}
        currentNumber={current.number}
        onClose={() => setSheet(false)}
        onSelect={(episode) => jumpTo(episode.number - 1, false)}
      />
    </View>
  );
}

function EpisodeInfo({
  show,
  episode,
  onOpenSheet,
}: {
  show: Series;
  episode: Episode;
  onOpenSheet: () => void;
}) {
  return (
    <View>
      <Text style={styles.episodeTitle}>
        Ep. {episode.number} · {episode.title}
      </Text>
      <Text style={styles.episodeBody} numberOfLines={2}>
        {show.tagline}
      </Text>
      <Pressable
        onPress={onOpenSheet}
        style={({ pressed }) => [styles.pick, pressed && styles.pressed]}>
        <Icon name="episodes" size={15} color={colors.text} />
        <Text style={styles.pickText}>Choose episode · {show.episodes.length} episodes</Text>
        <Icon name="up" size={14} color={colors.text} />
      </Pressable>
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
    backgroundColor: '#000',
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  topButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCopy: {
    flex: 1,
  },
  topTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
  topMeta: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  speed: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  speedText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  episodeTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 8,
  },
  episodeBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  pick: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  finale: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  finalePoster: {
    width: 120,
    height: 170,
    marginBottom: 8,
  },
  finaleTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  finaleBody: {
    color: colors.muted,
    fontSize: 14,
  },
  finaleButton: {
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 13,
  },
  finaleButtonText: {
    color: colors.onAccent,
    fontSize: 15,
    fontWeight: '800',
  },
  missing: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  missingText: {
    color: colors.text,
    fontSize: 18,
  },
  accentText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
