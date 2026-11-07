import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { colors } from '@/constants/theme';
import { useWallet } from '@/context/Wallet';
import type { Episode } from '@/data/catalog';
import { commentCount, formatAgo, hasProfanity, seedComments, type Comment } from '@/data/comments';
import { formatCount } from '@/lib/time';

const posted = new Map<string, Comment[]>();

export function totalComments(episodeId: string) {
  return commentCount(episodeId) + (posted.get(episodeId)?.length ?? 0);
}

type CommentSheetProps = {
  episode: Episode;
  visible: boolean;
  onClose: () => void;
  onPosted: () => void;
};

export function CommentSheet({ episode, visible, onClose, onPosted }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const { rewardComment } = useWallet();
  const seeded = useMemo(() => seedComments(episode.id), [episode.id]);
  const [mine, setMine] = useState<Comment[]>(() => posted.get(episode.id) ?? []);
  const [liked, setLiked] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const handle = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(handle);
  }, [toast]);

  const list = [...mine, ...seeded].filter((item) => !hidden.includes(item.id));

  function post() {
    const text = draft.trim();
    if (!text) return;
    if (hasProfanity(text)) {
      setError('Please keep it friendly. This comment contains blocked words.');
      return;
    }
    const comment: Comment = {
      id: `${episode.id}-mine-${Date.now()}`,
      author: 'You',
      text,
      minutesAgo: 0,
      likes: 0,
      mine: true,
    };
    const next = [comment, ...mine];
    posted.set(episode.id, next);
    setMine(next);
    setDraft('');
    setError('');
    onPosted();
    const earned = rewardComment();
    setToast(earned > 0 ? `+${earned} points for commenting` : 'Daily comment points reached');
  }

  function report(comment: Comment) {
    setHidden((current) => [...current, comment.id]);
    Alert.alert('Comment reported', 'Thanks for letting us know. Our team will review it within 24 hours.');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>
              {formatCount(totalComments(episode.id))} comments
            </Text>
            <Text style={styles.subtitle}>Ep. {episode.number}</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
              <Icon name="close" size={18} color={colors.muted} />
            </Pressable>
          </View>

          {toast ? (
            <View style={styles.toast}>
              <Icon name="points" size={16} color={colors.gold} />
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          ) : null}

          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isLiked = liked.includes(item.id);
              return (
                <View style={styles.comment}>
                  <View style={[styles.avatar, item.mine && styles.avatarMine]}>
                    <Text style={styles.avatarText}>{item.author[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.commentBody}>
                    <Text style={styles.author}>
                      {item.author} <Text style={styles.ago}>· {formatAgo(item.minutesAgo)}</Text>
                    </Text>
                    <Text style={styles.text}>{item.text}</Text>
                    <View style={styles.actions}>
                      <Pressable hitSlop={8} onPress={() => setDraft(`@${item.author} `)}>
                        <Text style={styles.action}>Reply</Text>
                      </Pressable>
                      {!item.mine ? (
                        <Pressable hitSlop={8} onPress={() => report(item)} style={styles.reportButton}>
                          <Icon name="flag" size={12} color={colors.faint} />
                          <Text style={styles.action}>Report</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                  <Pressable
                    hitSlop={8}
                    style={styles.like}
                    onPress={() =>
                      setLiked((current) =>
                        isLiked ? current.filter((id) => id !== item.id) : [...current, item.id],
                      )
                    }>
                    <Icon
                      name={isLiked ? 'heartFill' : 'heart'}
                      size={16}
                      color={isLiked ? colors.accent : colors.muted}
                    />
                    <Text style={styles.likeCount}>{formatCount(item.likes + (isLiked ? 1 : 0))}</Text>
                  </Pressable>
                </View>
              );
            }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={(value) => {
                setDraft(value);
                if (error) setError('');
              }}
              placeholder="Add a comment..."
              placeholderTextColor={colors.faint}
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={post}
              maxLength={300}
            />
            <Pressable onPress={post} disabled={!draft.trim()} hitSlop={8}>
              <Icon name="send" size={30} color={draft.trim() ? colors.accent : colors.faint} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sheet: {
    backgroundColor: colors.bgRaised,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    height: '62%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,195,77,0.12)',
  },
  toastText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  list: {
    flex: 1,
  },
  comment: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMine: {
    backgroundColor: colors.accent,
  },
  avatarText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  commentBody: {
    flex: 1,
  },
  author: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  ago: {
    color: colors.faint,
    fontWeight: '500',
  },
  text: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  action: {
    color: colors.faint,
    fontSize: 12,
    fontWeight: '700',
  },
  like: {
    alignItems: 'center',
    gap: 2,
    paddingTop: 4,
    minWidth: 32,
  },
  likeCount: {
    color: colors.muted,
    fontSize: 11,
  },
  error: {
    color: colors.accent,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
