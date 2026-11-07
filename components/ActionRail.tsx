import { Pressable, Share, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { colors } from '@/constants/theme';
import { usePlayback } from '@/context/Playback';
import type { Episode, Series } from '@/data/catalog';
import { formatCount } from '@/lib/time';

type ActionRailProps = {
  show: Series;
  episode: Episode;
  commentTotal: number;
  onEpisodes: () => void;
  onComments: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ActionRail({
  show,
  episode,
  commentTotal,
  onEpisodes,
  onComments,
  style,
}: ActionRailProps) {
  const { isLiked, toggleLiked, isSaved, toggleSaved } = usePlayback();
  const liked = isLiked(episode.id);
  const saved = isSaved(show.id);

  return (
    <View style={[styles.rail, style]}>
      <RailButton
        icon={liked ? 'heartFill' : 'heart'}
        color={liked ? colors.accent : colors.text}
        label={formatCount(show.likes + (liked ? 1 : 0))}
        onPress={() => toggleLiked(episode.id)}
      />
      <RailButton icon="comment" label={formatCount(commentTotal)} onPress={onComments} />
      <RailButton
        icon={saved ? 'bookmarkFill' : 'bookmark'}
        color={saved ? colors.gold : colors.text}
        label={saved ? 'Saved' : 'Save'}
        onPress={() => toggleSaved(show.id)}
      />
      <RailButton icon="episodes" label="Episodes" onPress={onEpisodes} />
      <RailButton
        icon="share"
        label="Share"
        onPress={() => {
          Share.share({
            message: `Watching ${show.title}, episode ${episode.number}, on DramaLama`,
          }).catch(() => {});
        }}
      />
    </View>
  );
}

type RailButtonProps = {
  icon: IconName;
  label: string;
  color?: string;
  onPress: () => void;
};

function RailButton({ icon, label, color = colors.text, onPress }: RailButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Icon name={icon} size={30} color={color} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: {
    alignItems: 'center',
    gap: 20,
  },
  button: {
    alignItems: 'center',
    gap: 4,
    minWidth: 52,
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 6,
  },
  pressed: {
    transform: [{ scale: 0.9 }],
  },
});
