import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompanionButton } from '@/components/CompanionButton';
import { Icon, type IconName } from '@/components/Icon';
import { colors } from '@/constants/theme';
import { usePlayback } from '@/context/Playback';
import { checkInPoints, streakBonusPoints, useWallet } from '@/context/Wallet';

function comingSoon(title: string) {
  Alert.alert(title, 'This screen is part of the next build.');
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const wallet = useWallet();
  const { entries } = usePlayback();
  const [reward, setReward] = useState('');

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const seriesToday = entries.filter((entry) => entry.updatedAt >= startOfDay.getTime()).length;

  const missions = [
    { title: 'Check in today', reward: checkInPoints, progress: wallet.checkedInToday ? 1 : 0, goal: 1 },
    { title: 'Comment on an episode', reward: 15, progress: Math.min(wallet.commentsToday, 1), goal: 1 },
    { title: 'Watch 2 different series today', reward: 20, progress: Math.min(seriesToday, 2), goal: 2 },
  ];

  const dayInWeek = wallet.streak === 0 ? 0 : ((wallet.streak - 1) % 7) + 1;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 110 }}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Icon name="profile" size={40} color={colors.muted} />
          </View>
          <View style={styles.userCopy}>
            <Text style={styles.userName}>Guest viewer</Text>
            <Text style={styles.customerLabel}>Customer ID · hold to copy</Text>
            <Text selectable style={styles.customerId}>
              {wallet.customerId}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              Alert.alert(
                'Create an account',
                'Sign in with Apple, Google, or email to keep your coins, points, and progress on every device.',
              )
            }
            style={({ pressed }) => [styles.signIn, pressed && styles.pressed]}>
            <Text style={styles.signInText}>Sign in</Text>
          </Pressable>
        </View>

        <View style={styles.wallet}>
          <View style={styles.walletHeader}>
            <Text style={styles.cardTitle}>My wallet</Text>
            <Pressable onPress={() => router.push('/store')} hitSlop={8} style={styles.storeLink}>
              <Icon name="store" size={14} color={colors.accent} />
              <Text style={styles.storeLinkText}>Store</Text>
            </Pressable>
          </View>
          <View style={styles.balances}>
            <Balance icon="coin" color={colors.gold} value={String(wallet.coins)} label="Coins" />
            <Balance icon="points" color={colors.accent} value={String(wallet.points)} label="Points" />
            <Balance icon="crown" color={colors.muted} value="Free" label="VIP status" />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.walletHeader}>
            <Text style={styles.cardTitle}>Daily check-in</Text>
            <View style={styles.streak}>
              <Icon name="flame" size={14} color={colors.gold} />
              <Text style={styles.streakText}>{wallet.streak}-day streak</Text>
            </View>
          </View>
          <View style={styles.days}>
            {Array.from({ length: 7 }, (_, index) => {
              const day = index + 1;
              const done = day <= dayInWeek;
              return (
                <View key={day} style={styles.day}>
                  <View style={[styles.dayDot, done && styles.dayDotDone, day === 7 && styles.dayDotBonus]}>
                    {done ? (
                      <Icon name="check" size={14} color={colors.onAccent} />
                    ) : (
                      <Icon name={day === 7 ? 'gift' : 'points'} size={14} color={day === 7 ? colors.gold : colors.faint} />
                    )}
                  </View>
                  <Text style={styles.dayLabel}>+{day === 7 ? checkInPoints + streakBonusPoints : checkInPoints}</Text>
                </View>
              );
            })}
          </View>
          <Pressable
            disabled={wallet.checkedInToday}
            onPress={() => {
              const earned = wallet.checkIn();
              if (earned > 0) setReward(`+${earned} points! Come back tomorrow to keep your streak.`);
            }}
            style={({ pressed }) => [
              styles.checkIn,
              wallet.checkedInToday && styles.checkInDone,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.checkInText}>
              {wallet.checkedInToday ? 'Checked in today' : `Check in · +${checkInPoints} points`}
            </Text>
          </Pressable>
          {reward ? <Text style={styles.reward}>{reward}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Missions</Text>
          {missions.map((mission) => {
            const done = mission.progress >= mission.goal;
            return (
              <View key={mission.title} style={styles.mission}>
                <View style={[styles.missionIcon, done && styles.missionIconDone]}>
                  <Icon name={done ? 'check' : 'mission'} size={16} color={done ? colors.onAccent : colors.accent} />
                </View>
                <View style={styles.missionCopy}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${(mission.progress / mission.goal) * 100}%` }]} />
                  </View>
                </View>
                <Text style={styles.missionReward}>
                  {done ? 'Done' : `+${mission.reward}`}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.menu}>
          <MenuRow icon="store" label="Store" detail="Coins, VIP, points" onPress={() => router.push('/store')} />
          <MenuRow icon="preferences" label="My preferences" detail="Genres and tropes you love" onPress={() => comingSoon('My preferences')} />
          <MenuRow icon="edit" label="Edit details" detail="Name, email, photo" onPress={() => comingSoon('Edit details')} />
          <MenuRow icon="settings" label="Settings" detail="Notifications, auto-unlock, privacy" onPress={() => comingSoon('Settings')} />
          <MenuRow
            icon="support"
            label="Support"
            detail="Chat with Lama or reach a human"
            onPress={() => router.push({ pathname: '/companion', params: { mode: 'support' } })}
            last
          />
        </View>
      </ScrollView>
      <CompanionButton />
    </View>
  );
}

function Balance({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  return (
    <View style={styles.balance}>
      <Icon name={icon} size={20} color={color} />
      <Text style={styles.balanceValue}>{value}</Text>
      <Text style={styles.balanceLabel}>{label}</Text>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  detail,
  onPress,
  last,
}: {
  icon: IconName;
  label: string;
  detail: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuRow, !last && styles.menuDivider, pressed && styles.pressed]}>
      <Icon name={icon} size={20} color={colors.text} />
      <View style={styles.menuCopy}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuDetail}>{detail}</Text>
      </View>
      <Icon name="forward" size={14} color={colors.faint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCopy: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  customerLabel: {
    color: colors.faint,
    fontSize: 11,
    marginTop: 4,
  },
  customerId: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 1,
  },
  signIn: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  signInText: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '800',
  },
  wallet: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: colors.bgRaised,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  storeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeLinkText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  balances: {
    flexDirection: 'row',
    marginTop: 14,
  },
  balance: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  balanceValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  balanceLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.bgRaised,
    borderRadius: 16,
    padding: 16,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  day: {
    alignItems: 'center',
    gap: 4,
  },
  dayDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: {
    backgroundColor: colors.accent,
  },
  dayDotBonus: {
    borderWidth: 1,
    borderColor: colors.gold,
  },
  dayLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  checkIn: {
    marginTop: 14,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  checkInDone: {
    backgroundColor: colors.card,
  },
  checkInText: {
    color: colors.onAccent,
    fontSize: 15,
    fontWeight: '800',
  },
  reward: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  mission: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  missionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionIconDone: {
    backgroundColor: colors.accent,
  },
  missionCopy: {
    flex: 1,
  },
  missionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginTop: 6,
    flexDirection: 'row',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  missionReward: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
    minWidth: 40,
    textAlign: 'right',
  },
  menu: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.bgRaised,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  menuDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  menuCopy: {
    flex: 1,
  },
  menuLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  menuDetail: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.75,
  },
});
