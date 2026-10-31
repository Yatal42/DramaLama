import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Poster } from '@/components/Poster';
import { colors, spacing } from '@/constants/theme';
import { categories, getCategory, type Series } from '@/data/catalog';
import { openCategory, openSearch, openSeries } from '@/lib/nav';
import { formatCount, seriesCount } from '@/lib/time';

const sorts = [
  { id: 'popular', label: 'Popular', compare: (a: Series, b: Series) => b.views - a.views },
  { id: 'rating', label: 'Top rated', compare: (a: Series, b: Series) => b.rating - a.rating },
  {
    id: 'short',
    label: 'Shortest',
    compare: (a: Series, b: Series) => a.episodes.length - b.episodes.length,
  },
] as const;

type SortId = (typeof sorts)[number]['id'];

export default function CategoryScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = getCategory(id ?? '');
  const [sort, setSort] = useState<SortId>('popular');
  const [width, setWidth] = useState(0);
  const shows = useMemo(() => {
    if (!category) return [];
    const compare = sorts.find((item) => item.id === sort)?.compare ?? sorts[0].compare;
    return [...category.series].sort(compare);
  }, [category, sort]);
  const gridWidth = width > 0 ? (width - spacing.screen * 2 - spacing.gap * 2) / 3 : 0;

  if (!category) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.missingText}>Category not found</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const others = categories.filter((item) => item.id !== category.id);

  return (
    <View style={styles.screen} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <LinearGradient
          colors={[`${category.accent}CC`, colors.bg]}
          style={[styles.hero, { paddingTop: insets.top + 56 }]}>
          <Text style={styles.kind}>{category.kind === 'genre' ? 'Genre' : 'Collection'}</Text>
          <Text style={styles.title}>{category.name}</Text>
          <Text style={styles.description}>{category.description}</Text>
          <Text style={styles.count}>{seriesCount(category.series.length)}</Text>
        </LinearGradient>

        <View style={styles.sorts}>
          {sorts.map((item) => {
            const selected = item.id === sort;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSort(item.id)}
                style={[styles.chip, selected && styles.chipSelected]}>
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.grid}>
          {gridWidth > 0
            ? shows.map((show) => (
                <Pressable
                  key={show.id}
                  onPress={() => openSeries(show.id)}
                  style={({ pressed }) => [{ width: gridWidth }, pressed && styles.pressed]}>
                  <Poster show={show} style={{ width: gridWidth, height: gridWidth * 1.42 }} />
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {show.title}
                  </Text>
                  <View style={styles.cardMeta}>
                    <Icon name="star" size={11} color={colors.gold} />
                    <Text style={styles.cardMetaText}>
                      {show.rating.toFixed(1)} · {formatCount(show.views)}
                    </Text>
                  </View>
                </Pressable>
              ))
            : null}
        </View>

        <Text style={styles.moreTitle}>More categories</Text>
        <FlatList
          data={others}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.more}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openCategory(item.id)}
              style={[styles.moreChip, { borderColor: item.accent }]}>
              <Text style={styles.moreChipText}>{item.name}</Text>
            </Pressable>
          )}
        />
      </ScrollView>

      <View style={[styles.top, { top: insets.top + 8 }]}>
        <Pressable onPress={goBack} hitSlop={10} style={styles.topButton}>
          <Icon name="back" size={20} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => openSearch()} hitSlop={10} style={styles.topButton}>
          <Icon name="search" size={18} color={colors.text} />
        </Pressable>
      </View>
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
  top: {
    position: 'absolute',
    left: spacing.screen,
    right: spacing.screen,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 20,
  },
  kind: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 2,
  },
  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 6,
  },
  count: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  sorts: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.screen,
    marginBottom: 16,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.card,
  },
  chipSelected: {
    backgroundColor: colors.text,
  },
  chipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: colors.bg,
  },
  grid: {
    paddingHorizontal: spacing.screen,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.gap,
    rowGap: 16,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 7,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardMetaText: {
    color: colors.muted,
    fontSize: 12,
  },
  moreTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 28,
    marginBottom: 10,
    paddingHorizontal: spacing.screen,
  },
  more: {
    paddingHorizontal: spacing.screen,
  },
  moreChip: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  moreChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
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
