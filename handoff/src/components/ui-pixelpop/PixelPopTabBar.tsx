// PixelPopTabBar.tsx — dolny pasek zakładek (glass) dla @react-navigation/bottom-tabs.
// Skopiuj do: src/components/ui-pixelpop/PixelPopTabBar.tsx
//
// Podłączenie w MainNavigator.tsx:
//   import { PixelPopTabBar } from '../components/ui-pixelpop/PixelPopTabBar';
//   <Tab.Navigator
//     screenOptions={{ headerShown: false }}
//     tabBar={(props) => <PixelPopTabBar {...props} />}
//   >
//     <Tab.Screen name="Listy" component={ListsStack} />
//     <Tab.Screen name="Szablony" component={TemplatesScreen} />
//     <Tab.Screen name="Profil" component={ProfileScreen} />
//   </Tab.Navigator>
//
// Mapowanie nazwa trasy -> ikona pixel:

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PP, PP_BORDER, ppText } from '../../constants/pixelPopTheme';
import { GlassBar } from './GlassBar';
import { PixelIcon } from './PixelIcon';

const ICONS: Record<string, string> = { Listy: 'cart', Szablony: 'template', Profil: 'user' };

export function PixelPopTabBar({ state, navigation }: BottomTabBarProps) {
  const accent = PP.pink;
  return (
    <GlassBar contentStyle={styles.content}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={route.name}
              style={styles.tab}
            >
              <View style={[styles.tile, focused && { backgroundColor: accent, borderWidth: PP_BORDER.thin, borderColor: PP.ink }]}>
                <PixelIcon name={ICONS[route.name] ?? 'cart'} size={16} color={PP.ink} />
              </View>
              <Text style={[ppText.tab, { color: focused ? PP.ink : PP.muted }]}>{route.name.toUpperCase()}</Text>
            </Pressable>
          );
        })}
      </View>
    </GlassBar>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  tile: { paddingHorizontal: 14, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
});

export default PixelPopTabBar;
