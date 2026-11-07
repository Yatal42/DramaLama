import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';

const icons = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  feed: { ios: 'play.rectangle.on.rectangle.fill', android: 'smart_display', web: 'smart_display' },
  library: { ios: 'bookmark.fill', android: 'bookmarks', web: 'bookmarks' },
  heart: { ios: 'heart', android: 'favorite', web: 'favorite' },
  heartFill: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  bookmark: { ios: 'bookmark', android: 'bookmark_add', web: 'bookmark_add' },
  bookmarkFill: { ios: 'bookmark.fill', android: 'bookmark_added', web: 'bookmark_added' },
  episodes: { ios: 'square.stack.fill', android: 'video_library', web: 'video_library' },
  share: { ios: 'arrowshape.turn.up.right.fill', android: 'share', web: 'share' },
  play: { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' },
  pause: { ios: 'pause.fill', android: 'pause', web: 'pause' },
  back: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  forward: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  up: { ios: 'chevron.up', android: 'expand_less', web: 'expand_less' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  star: { ios: 'star.fill', android: 'star', web: 'star' },
  flame: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
  eye: { ios: 'eye.fill', android: 'visibility', web: 'visibility' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  clear: { ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' },
  history: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
  trending: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  grid: { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view' },
  comment: { ios: 'bubble.right.fill', android: 'chat_bubble', web: 'chat_bubble' },
  profile: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' },
  store: { ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' },
  gift: { ios: 'gift.fill', android: 'redeem', web: 'redeem' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  support: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  preferences: { ios: 'slider.horizontal.3', android: 'tune', web: 'tune' },
  send: { ios: 'arrow.up.circle.fill', android: 'send', web: 'send' },
  flag: { ios: 'flag', android: 'flag', web: 'flag' },
  mission: { ios: 'target', android: 'track_changes', web: 'track_changes' },
  crown: { ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' },
  coin: { ios: 'dollarsign.circle.fill', android: 'paid', web: 'paid' },
  points: { ios: 'star.circle.fill', android: 'stars', web: 'stars' },
} satisfies Record<string, SymbolViewProps['name']>;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 22, color = colors.text, style }: IconProps) {
  return <SymbolView name={icons[name]} size={size} tintColor={color} style={style} />;
}
