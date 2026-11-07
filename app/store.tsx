import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { colors } from '@/constants/theme';
import { useWallet } from '@/context/Wallet';

type Pack = {
  id: string;
  title: string;
  bonus?: string;
  price: string;
  highlight?: boolean;
};

const coinPacks: Pack[] = [
  { id: 'c100', title: '100 coins', price: '$1.99' },
  { id: 'c300', title: '300 coins', bonus: '+30 bonus', price: '$4.99', highlight: true },
  { id: 'c700', title: '700 coins', bonus: '+120 bonus', price: '$9.99' },
  { id: 'c1500', title: '1,500 coins', bonus: '+400 bonus', price: '$19.99' },
];

const vipPlans: Pack[] = [
  { id: 'vw', title: 'Weekly VIP', price: '$4.99 / week' },
  { id: 'vm', title: 'Monthly VIP', bonus: 'Most popular', price: '$14.99 / month', highlight: true },
  { id: 'vy', title: 'Yearly VIP', bonus: 'Save 45%', price: '$99.99 / year' },
];

const pointPacks: Pack[] = [
  { id: 'p200', title: '200 points', price: '$0.99' },
  { id: 'p1000', title: '1,000 points', bonus: '+100 bonus', price: '$3.99' },
];

function buy(pack: Pack) {
  Alert.alert(
    pack.title,
    `${pack.price}\n\nIn the live app this purchase goes through the App Store or Google Play. Purchases are not connected in this demo.`,
  );
}

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const { coins, points } = useWallet();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Icon name="back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Store</Text>
      </View>

      <View style={styles.balances}>
        <Balance icon="coin" color={colors.gold} label="Coins" value={coins} />
        <Balance icon="points" color={colors.accent} label="Points" value={points} />
      </View>

      <Section title="VIP" subtitle="Unlock every episode and remove ads" icon="crown">
        {vipPlans.map((pack) => (
          <PackRow key={pack.id} pack={pack} />
        ))}
      </Section>
      <Section title="Coins" subtitle="Unlock episodes one by one" icon="coin">
        {coinPacks.map((pack) => (
          <PackRow key={pack.id} pack={pack} />
        ))}
      </Section>
      <Section title="Points" subtitle="Get rewards and companion outfits faster" icon="points">
        {pointPacks.map((pack) => (
          <PackRow key={pack.id} pack={pack} />
        ))}
      </Section>
      <Pressable onPress={() => Alert.alert('Restore purchases', 'Nothing to restore in this demo.')}>
        <Text style={styles.restore}>Restore purchases</Text>
      </Pressable>
    </ScrollView>
  );
}

function Balance({ icon, color, label, value }: { icon: IconName; color: string; label: string; value: number }) {
  return (
    <View style={styles.balance}>
      <Icon name={icon} size={22} color={color} />
      <View>
        <Text style={styles.balanceValue}>{value}</Text>
        <Text style={styles.balanceLabel}>{label}</Text>
      </View>
    </View>
  );
}

function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: IconName;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name={icon} size={18} color={colors.gold} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      <View style={styles.packs}>{children}</View>
    </View>
  );
}

function PackRow({ pack }: { pack: Pack }) {
  return (
    <Pressable
      onPress={() => buy(pack)}
      style={({ pressed }) => [styles.pack, pack.highlight && styles.packHighlight, pressed && styles.pressed]}>
      <View style={styles.packCopy}>
        <Text style={styles.packTitle}>{pack.title}</Text>
        {pack.bonus ? <Text style={styles.packBonus}>{pack.bonus}</Text> : null}
      </View>
      <View style={styles.price}>
        <Text style={styles.priceText}>{pack.price}</Text>
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
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  balances: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  balance: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bgRaised,
    borderRadius: 14,
    padding: 14,
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
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  packs: {
    gap: 8,
    marginTop: 12,
  },
  pack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgRaised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
  },
  packHighlight: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  packCopy: {
    flex: 1,
  },
  packTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  packBonus: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  price: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  priceText: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '800',
  },
  restore: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 28,
  },
  pressed: {
    opacity: 0.8,
  },
});
