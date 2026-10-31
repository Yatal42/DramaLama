import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { Episode, Series } from '@/data/catalog';

const pageSize = 30;

type EpisodeGridProps = {
  show: Series;
  currentNumber?: number;
  columns?: number;
  onSelect: (episode: Episode) => void;
};

export function EpisodeGrid({ show, currentNumber, columns = 6, onSelect }: EpisodeGridProps) {
  const pages = Math.ceil(show.episodes.length / pageSize);
  const [page, setPage] = useState(() =>
    currentNumber ? Math.min(pages - 1, Math.floor((currentNumber - 1) / pageSize)) : 0,
  );
  const [width, setWidth] = useState(0);
  const gap = 8;
  const tile = width > 0 ? (width - gap * (columns - 1)) / columns : 0;
  const visible = show.episodes.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <View>
      {pages > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ranges}>
          {Array.from({ length: pages }, (_, index) => {
            const from = index * pageSize + 1;
            const to = Math.min(show.episodes.length, (index + 1) * pageSize);
            const selected = index === page;
            return (
              <Pressable key={from} onPress={() => setPage(index)} style={styles.range}>
                <Text style={[styles.rangeText, selected && styles.rangeTextSelected]}>
                  {from}-{to}
                </Text>
                {selected ? <View style={styles.rangeLine} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <View
        style={[styles.grid, { gap }]}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {tile > 0
          ? visible.map((episode) => {
              const current = episode.number === currentNumber;
              const watched = currentNumber !== undefined && episode.number < currentNumber;
              return (
                <Pressable
                  key={episode.id}
                  onPress={() => onSelect(episode)}
                  style={({ pressed }) => [
                    styles.tile,
                    { width: tile, height: tile * 0.82 },
                    watched && styles.tileWatched,
                    current && styles.tileCurrent,
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      styles.tileText,
                      watched && styles.tileTextWatched,
                      current && styles.tileTextCurrent,
                    ]}>
                    {episode.number}
                  </Text>
                  {current ? <PlayingBars /> : null}
                </Pressable>
              );
            })
          : null}
      </View>
    </View>
  );
}

function PlayingBars() {
  return (
    <View style={styles.bars}>
      <View style={[styles.bar, { height: 6 }]} />
      <View style={[styles.bar, { height: 10 }]} />
      <View style={[styles.bar, { height: 4 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ranges: {
    flexDirection: 'row',
    gap: 20,
    paddingBottom: 12,
    flexGrow: 1,
  },
  range: {
    paddingBottom: 6,
    alignItems: 'center',
  },
  rangeText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  rangeTextSelected: {
    color: colors.text,
    fontWeight: '800',
  },
  rangeLine: {
    marginTop: 4,
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tileWatched: {
    backgroundColor: colors.bgRaised,
  },
  tileCurrent: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  tileText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  tileTextWatched: {
    color: colors.faint,
  },
  tileTextCurrent: {
    color: colors.accent,
  },
  bars: {
    position: 'absolute',
    bottom: 5,
    right: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
});
