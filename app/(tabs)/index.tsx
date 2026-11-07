import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryTile } from '@/components/CategoryTile';
import { CompanionButton } from '@/components/CompanionButton';
import { Icon } from '@/components/Icon';
import { BadgeTag, Poster } from '@/components/Poster';
import { colors, gradients, spacing } from '@/constants/theme';
import { usePlayback } from '@/context/Playback';
import {
  allGenres,
  categories,
  featured,
  fresh,
  genres,
  getSeries,
  seriesList,
  trending,
  type Series,
} from '@/data/catalog';
import { openEpisode, openSearch, openSeries, resumeEpisode } from '@/lib/nav';
import { formatCount } from '@/lib/time';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { entries } = usePlayback();
  const [frameWidth, setFrameWidth] = useState(() => Math.min(width, 480));
  const [genre, setGenre] = useState(allGenres);
  const shows = useMemo(
    () => (genre === allGenres ? seriesList : seriesList.filter((item) => item.genre === genre)),
    [genre],
  );
  const continuing = entries.flatMap((entry) => {
    const show = getSeries(entry.seriesId);
    return show ? [{ show, entry }] : [];
  });
  const gridWidth = (frameWidth - spacing.screen * 2 - spacing.gap * 2) / 3;

  return (
    <View
      style={styles.screen}
      onLayout={(event) => setFrameWidth(event.nativeEvent.layout.width)}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brand}>
            Drama<Text style={styles.brandAccent}>Lama</Text>
          </Text>
          <Pressable
            onPress={() => openSearch()}
            style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}>
            <Icon name="search" size={16} color={colors.muted} />
            <Text style={styles.searchText} numberOfLines={1}>
              Search series
            </Text>
          </Pressable>
        </View>

        <HeroCarousel width={frameWidth} />

        {continuing.length > 0 ? (
          <Section title="Continue watching">
            <Row
              data={continuing}
              keyOf={(item) => item.show.id}
              renderItem={({ show, entry }) => {
                const episode = resumeEpisode(show, entry);
                return (
                  <Pressable
                    onPress={() => openEpisode(show.id, episode.id)}
                    style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}>
                    <Poster show={show} showBadge={false} showMeta={false} style={styles.continuePoster}>
                      <View style={styles.continuePlay}>
                        <Icon name="play" size={16} color={colors.text} />
                      </View>
                      <View style={styles.continueTrack}>
                        <View
                          style={[
                            styles.continueFill,
                            { width: `${(episode.number / show.episodes.length) * 100}%` },
                          ]}
                        />
                      </View>
                    </Poster>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {show.title}
                    </Text>
                    <Text style={styles.cardMeta}>
                      Ep. {episode.number} of {show.episodes.length}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Section>
        ) : null}

        <Section title="Trending now" icon="flame">
          <Row
            data={trending.slice(0, 10)}
            keyOf={(item) => item.id}
            renderItem={(show, index) => (
              <Pressable
                onPress={() => openSeries(show.id)}
                style={({ pressed }) => [styles.rankCard, pressed && styles.pressed]}>
                <Poster show={show} showMeta={false} style={styles.rankPoster} />
                <Text style={[styles.rankNumber, index < 3 && styles.rankNumberTop]}>{index + 1}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {show.title}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {show.tags[0]}
                </Text>
              </Pressable>
            )}
          />
        </Section>

        <Section title="New & exclusive" icon="sparkles">
          <Row
            data={fresh}
            keyOf={(item) => item.id}
            renderItem={(show) => (
              <Pressable
                onPress={() => openSeries(show.id)}
                style={({ pressed }) => [styles.wideCard, pressed && styles.pressed]}>
                <Poster show={show} style={styles.widePoster} />
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {show.title}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {show.tagline}
                </Text>
              </Pressable>
            )}
          />
        </Section>

        <Section title="Categories" icon="grid" action="See all" onAction={() => openSearch()}>
          <Row
            data={categories}
            keyOf={(item) => item.id}
            renderItem={(item) => <CategoryTile category={item} style={styles.categoryTile} />}
          />
        </Section>

        <Section title="Browse by genre">
          <View style={styles.chips}>
            <Row
              data={genres}
              keyOf={(item) => item}
              gap={8}
              renderItem={(item) => {
                const selected = item === genre;
                return (
                  <Pressable
                    onPress={() => setGenre(item)}
                    style={[styles.chip, selected && styles.chipSelected]}>
                    <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
          <View style={styles.grid}>
            {shows.map((show) => (
              <Pressable
                key={show.id}
                onPress={() => openSeries(show.id)}
                style={({ pressed }) => [{ width: gridWidth }, pressed && styles.pressed]}>
                <Poster show={show} style={{ width: gridWidth, height: gridWidth * 1.42 }} />
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {show.title}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {show.genre}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>
      </ScrollView>
      <CompanionButton />
    </View>
  );
}

function HeroCarousel({ width }: { width: number }) {
  const { getProgress, isSaved, toggleSaved } = usePlayback();
  const listRef = useRef<FlatList<Series>>(null);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const cardHeight = Math.min(520, (width - spacing.screen * 2) * 1.25);

  useEffect(() => {
    if (dragging) return;
    const handle = setTimeout(() => {
      const next = (index + 1) % featured.length;
      listRef.current?.scrollToOffset({ offset: next * width, animated: true });
      setIndex(next);
    }, 5000);
    return () => clearTimeout(handle);
  }, [dragging, index, width]);

  return (
    <View style={styles.hero}>
      <FlatList
        ref={listRef}
        data={featured}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, itemIndex) => ({ length: width, offset: width * itemIndex, index: itemIndex })}
        onScrollBeginDrag={() => setDragging(true)}
        onMomentumScrollEnd={(event) => {
          setDragging(false);
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => {
          const episode = resumeEpisode(item, getProgress(item.id));
          const saved = isSaved(item.id);
          return (
            <View style={{ width, paddingHorizontal: spacing.screen }}>
              <Pressable onPress={() => openSeries(item.id)}>
                <Poster
                  show={item}
                  radius={18}
                  showBadge={false}
                  showMeta={false}
                  style={{ height: cardHeight }}>
                  <LinearGradient
                    colors={['rgba(8,8,12,0)', 'rgba(8,8,12,0.9)']}
                    style={styles.heroFade}
                  />
                  <View style={styles.heroCopy}>
                    <View style={styles.heroTags}>
                      {item.badge ? <BadgeTag badge={item.badge} style={styles.heroBadge} /> : null}
                      <View style={styles.heroStat}>
                        <Icon name="star" size={12} color={colors.gold} />
                        <Text style={styles.heroStatText}>{item.rating.toFixed(1)}</Text>
                      </View>
                      <View style={styles.heroStat}>
                        <Icon name="eye" size={12} color={colors.text} />
                        <Text style={styles.heroStatText}>{formatCount(item.views)}</Text>
                      </View>
                    </View>
                    <Text style={styles.heroTitle}>{item.title}</Text>
                    <Text style={styles.heroTagline} numberOfLines={2}>
                      {item.tagline}
                    </Text>
                    <View style={styles.heroActions}>
                      <Pressable
                        onPress={() => openEpisode(item.id, episode.id)}
                        style={({ pressed }) => [styles.heroPlayWrap, pressed && styles.pressed]}>
                        <LinearGradient
                          colors={gradients.accent}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.heroPlay}>
                          <Icon name="play" size={16} color={colors.onAccent} />
                          <Text style={styles.heroPlayText}>
                            {episode.number > 1 ? `Continue ep. ${episode.number}` : 'Watch now'}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                      <Pressable
                        onPress={() => toggleSaved(item.id)}
                        style={({ pressed }) => [styles.heroSave, pressed && styles.pressed]}>
                        <Icon
                          name={saved ? 'bookmarkFill' : 'bookmark'}
                          size={20}
                          color={saved ? colors.gold : colors.text}
                        />
                      </Pressable>
                    </View>
                  </View>
                </Poster>
              </Pressable>
            </View>
          );
        }}
      />
      <View style={styles.dots}>
        {featured.map((item, dotIndex) => (
          <View key={item.id} style={[styles.dot, dotIndex === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function Section({
  title,
  icon,
  action,
  onAction,
  children,
}: {
  title: string;
  icon?: 'flame' | 'sparkles' | 'grid';
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon ? <Icon name={icon} size={18} color={colors.accent} /> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        {action && onAction ? (
          <Pressable onPress={onAction} hitSlop={8} style={styles.sectionAction}>
            <Text style={styles.sectionActionText}>{action}</Text>
            <Icon name="forward" size={12} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Row<T>({
  data,
  keyOf,
  gap = spacing.gap,
  renderItem,
}: {
  data: T[];
  keyOf: (item: T) => string;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactElement;
}) {
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={keyOf}
      contentContainerStyle={styles.row}
      ItemSeparatorComponent={() => <View style={{ width: gap }} />}
      renderItem={({ item, index }) => renderItem(item, index)}
    />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    marginBottom: 14,
  },
  brand: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: colors.accent,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    height: 34,
    minWidth: 140,
  },
  searchText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionAction: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionActionText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryTile: {
    width: 150,
  },
  hero: {
    marginBottom: 8,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '40%',
  },
  heroCopy: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  heroTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroBadge: {
    position: 'relative',
    borderRadius: 6,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  heroStatText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  heroTagline: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  heroPlayWrap: {
    flex: 1,
  },
  heroPlay: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 13,
  },
  heroPlayText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '800',
  },
  heroSave: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.accent,
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.screen,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  row: {
    paddingHorizontal: spacing.screen,
  },
  continueCard: {
    width: 132,
  },
  continuePoster: {
    width: 132,
    height: 180,
  },
  continuePlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    flexDirection: 'row',
  },
  continueFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  rankCard: {
    width: 128,
  },
  rankPoster: {
    width: 128,
    height: 180,
  },
  rankNumber: {
    position: 'absolute',
    top: 118,
    left: 6,
    color: colors.text,
    fontSize: 54,
    fontWeight: '900',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 10,
  },
  rankNumberTop: {
    color: colors.gold,
  },
  wideCard: {
    width: 220,
  },
  widePoster: {
    width: 220,
    height: 140,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 7,
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  chips: {
    marginBottom: 14,
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
  chipLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  chipLabelSelected: {
    color: colors.onAccent,
  },
  grid: {
    paddingHorizontal: spacing.screen,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.gap,
    rowGap: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});
