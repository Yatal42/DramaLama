import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryTile } from '@/components/CategoryTile';
import { Icon } from '@/components/Icon';
import { Poster } from '@/components/Poster';
import { colors, spacing } from '@/constants/theme';
import { allGenres, categories, popularSearches, searchSeries, type Series } from '@/data/catalog';
import { openSeries } from '@/lib/nav';
import { formatCount, resultCount } from '@/lib/time';
import { useRecentSearches } from '@/lib/useRecentSearches';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(() => params.q ?? '');
  const [genre, setGenre] = useState(allGenres);
  const [width, setWidth] = useState(0);
  const { recent, addRecent, removeRecent, clearRecent } = useRecentSearches();
  const results = useMemo(() => searchSeries(query), [query]);
  const resultGenres = useMemo(
    () => [allGenres, ...Array.from(new Set(results.map((item) => item.genre)))],
    [results],
  );
  const activeGenre = resultGenres.includes(genre) ? genre : allGenres;
  const filtered =
    activeGenre === allGenres ? results : results.filter((item) => item.genre === activeGenre);
  const tileWidth = width > 0 ? (width - spacing.screen * 2 - spacing.gap) / 2 : 0;
  const searching = query.trim().length > 0;

  function runSearch(value: string) {
    setQuery(value);
    setGenre(allGenres);
    addRecent(value);
    Keyboard.dismiss();
  }

  function pick(show: Series) {
    addRecent(query);
    openSeries(show.id);
  }

  return (
    <View style={styles.screen} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.field}>
          <Icon name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => runSearch(query)}
            placeholder="Search series, genres, or tropes"
            placeholderTextColor={colors.faint}
            autoFocus={!params.q}
            autoCorrect={false}
            returnKeyType="search"
            selectionColor={colors.accent}
            style={styles.input}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Icon name="clear" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {searching ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>{resultCount(filtered.length)}</Text>
            </View>
            {resultGenres.length > 2 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filters}>
                {resultGenres.map((item) => {
                  const selected = item === activeGenre;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setGenre(item)}
                      style={[styles.chip, selected && styles.chipSelected]}>
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}
            {filtered.map((show) => (
              <ResultRow key={show.id} show={show} onPress={() => pick(show)} />
            ))}
            {results.length === 0 ? (
              <View style={styles.empty}>
                <Icon name="search" size={30} color={colors.faint} />
                <Text style={styles.emptyTitle}>No matches for &quot;{query.trim()}&quot;</Text>
                <Text style={styles.emptyBody}>Try another word, or one of the popular searches</Text>
                <View style={styles.wrap}>
                  {popularSearches.map((item) => (
                    <Pressable key={item} onPress={() => runSearch(item)} style={styles.chip}>
                      <Text style={styles.chipText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <>
            {recent.length > 0 ? (
              <View style={styles.block}>
                <View style={styles.blockHeader}>
                  <Text style={styles.blockTitle}>Recent searches</Text>
                  <Pressable onPress={clearRecent} hitSlop={8}>
                    <Text style={styles.link}>Clear</Text>
                  </Pressable>
                </View>
                {recent.map((item) => (
                  <View key={item} style={styles.recentRow}>
                    <Pressable onPress={() => runSearch(item)} style={styles.recentMain}>
                      <Icon name="history" size={16} color={colors.muted} />
                      <Text style={styles.recentText} numberOfLines={1}>
                        {item}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => removeRecent(item)} hitSlop={10}>
                      <Icon name="close" size={14} color={colors.faint} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.block}>
              <View style={styles.blockHeader}>
                <Text style={styles.blockTitle}>Popular searches</Text>
              </View>
              <View style={styles.popular}>
                {popularSearches.map((item, index) => (
                  <Pressable
                    key={item}
                    onPress={() => runSearch(item)}
                    style={({ pressed }) => [styles.popularItem, pressed && styles.pressed]}>
                    <Text style={[styles.popularRank, index < 3 && styles.popularRankTop]}>
                      {index + 1}
                    </Text>
                    <Text style={styles.popularText} numberOfLines={1}>
                      {item}
                    </Text>
                    {index < 3 ? <Icon name="trending" size={14} color={colors.accent} /> : null}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.block}>
              <View style={styles.blockHeader}>
                <Text style={styles.blockTitle}>Categories</Text>
              </View>
              <View style={styles.tiles}>
                {tileWidth > 0
                  ? categories.map((item) => (
                      <CategoryTile key={item.id} category={item} style={{ width: tileWidth }} />
                    ))
                  : null}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ResultRow({ show, onPress }: { show: Series; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.result, pressed && styles.pressed]}>
      <Poster show={show} showMeta={false} style={styles.resultPoster} radius={8} />
      <View style={styles.resultCopy}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {show.title}
        </Text>
        <Text style={styles.resultMeta}>
          {show.genre} · {show.episodes.length} episodes · {formatCount(show.views)} views
        </Text>
        <Text style={styles.resultTagline} numberOfLines={2}>
          {show.tagline}
        </Text>
        <View style={styles.resultTags}>
          {show.tags.slice(0, 3).map((tag) => (
            <Text key={tag} style={styles.resultTag}>
              {tag}
            </Text>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.screen,
    paddingBottom: 12,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 42,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  cancel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  block: {
    marginTop: 18,
    paddingHorizontal: spacing.screen,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  blockTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  link: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  recentMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recentText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  popular: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 4,
  },
  popularItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingRight: 8,
  },
  popularRank: {
    width: 18,
    color: colors.faint,
    fontSize: 15,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  popularRankTop: {
    color: colors.accent,
  },
  popularText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.gap,
  },
  resultsHeader: {
    paddingHorizontal: spacing.screen,
    marginTop: 4,
  },
  resultsCount: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    flexGrow: 1,
    gap: 8,
    paddingHorizontal: spacing.screen,
    paddingVertical: 12,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.card,
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  chipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: colors.onAccent,
  },
  result: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: spacing.screen,
    paddingVertical: 10,
  },
  resultPoster: {
    width: 84,
    height: 118,
  },
  resultCopy: {
    flex: 1,
    paddingTop: 2,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  resultMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  resultTagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  resultTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  resultTag: {
    color: colors.muted,
    backgroundColor: colors.card,
    fontSize: 11,
    fontWeight: '600',
    borderRadius: 4,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    marginTop: 40,
    paddingHorizontal: spacing.screen * 2,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  pressed: {
    opacity: 0.75,
  },
});
