import { Tabs } from 'expo-router';
import { Icon } from '@/components/icons';
import { useLang } from '@/lib/i18n';
import { c } from '@/lib/theme';

export default function TabsLayout() {
  const { tr } = useLang();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.orange,
        tabBarInactiveTintColor: c.inkDim,
        tabBarStyle: { backgroundColor: c.cream, borderTopColor: c.gray },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: c.cream },
      }}
    >
      <Tabs.Screen name="index"  options={{ title: tr('주보'), tabBarIcon: ({ color }) => <Icon name="bulletin" color={color} /> }} />
      <Tabs.Screen name="notes"  options={{ title: tr('노트'), tabBarIcon: ({ color }) => <Icon name="notes" color={color} /> }} />
      <Tabs.Screen name="wall"   options={{ title: tr('나눔'), tabBarIcon: ({ color }) => <Icon name="wall" color={color} /> }} />
      <Tabs.Screen name="church" options={{ title: tr('교회'), tabBarIcon: ({ color }) => <Icon name="church" color={color} /> }} />
    </Tabs>
  );
}
