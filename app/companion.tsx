import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanionAvatar } from '@/components/CompanionButton';
import { Icon } from '@/components/Icon';
import { Poster } from '@/components/Poster';
import { colors } from '@/constants/theme';
import { usePlayback } from '@/context/Playback';
import { useWallet } from '@/context/Wallet';
import {
  companionName,
  greeting,
  message,
  quickReplies,
  reply,
  type ChatMessage,
} from '@/lib/companion';
import { openSeries } from '@/lib/nav';

export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === 'support' ? 'support' : 'chat';
  const { customerId, coins, points, streak } = useWallet();
  const { saved, entries } = usePlayback();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [greeting(mode)]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function send(text: string) {
    const value = text.trim();
    if (!value || typing) return;
    setMessages((current) => [...current, message('viewer', value)]);
    setDraft('');
    setTyping(true);
    const answers = reply(value, {
      customerId,
      coins,
      points,
      streak,
      savedIds: saved,
      watchedIds: entries.map((entry) => entry.seriesId),
    });
    timers.current.push(
      setTimeout(() => {
        setTyping(false);
        setMessages((current) => [...current, ...answers]);
      }, 900),
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <CompanionAvatar size={40} />
        <View style={styles.headerCopy}>
          <Text style={styles.name}>{companionName}</Text>
          <Text style={styles.status}>{typing ? 'typing...' : 'Your drama companion · online'}</Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.close}>
          <Icon name="close" size={18} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((item) =>
          item.from === 'system' ? (
            <View key={item.id} style={styles.system}>
              <Icon name="support" size={14} color={colors.gold} />
              <Text style={styles.systemText}>{item.text}</Text>
            </View>
          ) : (
            <View
              key={item.id}
              style={[styles.bubbleRow, item.from === 'viewer' && styles.bubbleRowMine]}>
              <View style={[styles.bubble, item.from === 'viewer' ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={styles.bubbleText}>{item.text}</Text>
              </View>
              {item.series ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
                  {item.series.map((show) => (
                    <Pressable
                      key={show.id}
                      onPress={() => openSeries(show.id)}
                      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                      <Poster show={show} showMeta={false} style={styles.cardPoster} radius={8} />
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {show.title}
                      </Text>
                      <Text style={styles.cardMeta}>
                        {show.genre} · {show.episodes.length} eps
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}
            </View>
          ),
        )}
        {typing ? (
          <View style={styles.bubbleRow}>
            <View style={[styles.bubble, styles.bubbleTheirs]}>
              <Text style={styles.typing}>• • •</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickBar}
        contentContainerStyle={styles.quick}
        keyboardShouldPersistTaps="handled">
        {quickReplies.map((text) => (
          <Pressable
            key={text}
            onPress={() => send(text)}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
            <Text style={styles.chipText}>{text}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={`Message ${companionName}...`}
          placeholderTextColor={colors.faint}
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={() => send(draft)}
        />
        <Pressable onPress={() => send(draft)} disabled={!draft.trim()} hitSlop={8}>
          <Icon name="send" size={32} color={draft.trim() ? colors.accent : colors.faint} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  headerCopy: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  status: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 10,
  },
  bubbleRow: {
    alignItems: 'flex-start',
    gap: 8,
  },
  bubbleRowMine: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleTheirs: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 6,
  },
  bubbleMine: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 6,
  },
  bubbleText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  typing: {
    color: colors.muted,
    fontSize: 15,
    letterSpacing: 2,
  },
  system: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,195,77,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  systemText: {
    flex: 1,
    color: colors.gold,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  cards: {
    gap: 10,
    paddingRight: 16,
  },
  card: {
    width: 110,
  },
  cardPoster: {
    width: 110,
    height: 156,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  quickBar: {
    flexGrow: 0,
  },
  quick: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgRaised,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  pressed: {
    opacity: 0.75,
  },
});
