import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EpisodeGrid } from '@/components/EpisodeGrid';
import { Icon } from '@/components/Icon';
import { Poster } from '@/components/Poster';
import { colors } from '@/constants/theme';
import type { Episode, Series } from '@/data/catalog';

type EpisodeSheetProps = {
  show: Series;
  visible: boolean;
  currentNumber?: number;
  onClose: () => void;
  onSelect: (episode: Episode) => void;
};

export function EpisodeSheet({ show, visible, currentNumber, onClose, onSelect }: EpisodeSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Poster show={show} showBadge={false} showMeta={false} style={styles.thumb} radius={6} />
            <View style={styles.headerCopy}>
              <Text style={styles.title} numberOfLines={1}>
                {show.title}
              </Text>
              <Text style={styles.subtitle}>
                {show.episodes.length} episodes · {show.genre}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
              <Icon name="close" size={18} color={colors.muted} />
            </Pressable>
          </View>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <EpisodeGrid
              show={show}
              currentNumber={currentNumber}
              onSelect={(episode) => {
                onClose();
                onSelect(episode);
              }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.bgRaised,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '72%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  thumb: {
    width: 44,
    height: 60,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
});
