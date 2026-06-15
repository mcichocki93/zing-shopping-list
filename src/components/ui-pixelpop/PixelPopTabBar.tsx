import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PP, PP_BORDER, PP_FONT } from '../../constants/pixelPopTheme';
import { PixelIcon } from './PixelIcon';
import { useTheme } from '../../contexts/ThemeContext';

const ICONS: Record<string, string> = { Listy: 'cart', Profil: 'user' };
const SHADOW = 4;

export function PixelPopTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { pixelPopAccent } = useTheme();
  const overlayAlpha = Platform.OS === 'android' ? 0.92 : 0.78;

  return (
    <View
      style={[styles.outer, { bottom: insets.bottom + 14 }]}
      pointerEvents="box-none"
    >
      {/* Pixel hard shadow */}
      <View style={styles.shadow} pointerEvents="none" />

      {/* Floating glass bar */}
      <View style={styles.bar}>
        <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255,248,238,${overlayAlpha})` }]} />
        {/* top sheen */}
        <View style={styles.sheen} pointerEvents="none" />

        <View style={styles.tabs}>
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
                <View style={[styles.tile, focused && { backgroundColor: pixelPopAccent, borderWidth: PP_BORDER.base, borderColor: PP.ink }]}>
                  <PixelIcon name={ICONS[route.name] ?? 'cart'} size={16} color={PP.ink} />
                </View>
                <Text style={[styles.label, { color: focused ? PP.ink : PP.muted }]}>
                  {route.name.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 20,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW,
    left: SHADOW,
    right: -SHADOW,
    bottom: -SHADOW,
    backgroundColor: PP.ink,
  },
  bar: {
    borderWidth: PP_BORDER.thick,
    borderColor: PP.ink,
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  tabs: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tile: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: PP_FONT.uiSemi,
    fontSize: 9,
  },
});

export default PixelPopTabBar;
