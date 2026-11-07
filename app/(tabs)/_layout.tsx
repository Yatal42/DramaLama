import { Tabs } from 'expo-router';

import { Icon } from '@/components/Icon';
import { colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: colors.line,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="foryou"
        options={{
          title: 'For You',
          tabBarIcon: ({ color }) => <Icon name="feed" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Icon name="library" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="profile" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
