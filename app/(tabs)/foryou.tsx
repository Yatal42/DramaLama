import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EpisodeSheet } from '@/components/EpisodeSheet';
import { Icon } from '@/components/Icon';
import { ShortPage } from '@/components/ShortPlayer';
import { colors } from '@/constants/theme';
import { trending, type Series } from '@/data/catalog';
import { openEpisode } from '@/lib/nav';

export default function ForYouScreen() {
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(true);
  const [sheetShow, setSheetShow] = useState<Series | null>(null);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  return (
    <View style={styles.screen} onLayout={(event) => setHeight(event.nativeEvent.layout.height)}>
      {height > 0 ? (
        <FlatList
          data={trending}
          extraData={`${index}-${focused}-${sheetShow?.id}`}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          windowSize={3}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          getItemLayout={(_, itemIndex) => ({ length: height, offset: height * itemIndex, index: itemIndex })}
          onMomentumScrollEnd={(event) =>
            setIndex(Math.round(event.nativeEvent.contentOffset.y / height))
          }
          renderItem={({ item, index: itemIndex }) => (
            <ShortPage
              show={item}
              episode={item.episodes[0]}
              height={height}
              near={Math.abs(itemIndex - index) <= 1}
              active={focused && !sheetShow && itemIndex === index}
              loop
              onEpisodes={() => setSheetShow(item)}
              info={<FeedInfo show={item} />}
            />
          )}
        />
      ) : null}

      <View pointerEvents="none" style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.topTitle}>For You</Text>
      </View>

      {sheetShow ? (
        <EpisodeSheet
          show={sheetShow}
          visible
          currentNumber={1}
          onClose={() => setSheetShow(null)}
          onSelect={(episode) => openEpisode(sheetShow.id, episode.id)}
        />
      ) : null}
    </View>
  );
}

function FeedInfo({ show }: { show: Series }) {
  return (
    <View>
      <View style={styles.tags}>
        <Text style={styles.genre}>{show.genre}</Text>
        {show.tags.slice(0, 2).map((tag) => (
          <Text key={tag} style={styles.tag}>
            #{tag}
          </Text>
        ))}
      </View>
      <Text style={styles.title}>{show.title}</Text>
      <Text style={styles.synopsis} numberOfLines={2}>
        {show.synopsis}
      </Text>
      <Pressable
        onPress={() => openEpisode(show.id, show.episodes[0].id)}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <Icon name="episodes" size={16} color={colors.text} />
        <Text style={styles.ctaText}>Watch full series · {show.episodes.length} episodes</Text>
        <Icon name="forward" size={14} color={colors.text} />
      </Pressable>
    </View>
  );
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
    alignItems: 'center',
  },
  topTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  genre: {
    color: colors.onAccent,
    backgroundColor: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    borderRadius: 4,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tag: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 8,
  },
  synopsis: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  cta: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ctaText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
});
