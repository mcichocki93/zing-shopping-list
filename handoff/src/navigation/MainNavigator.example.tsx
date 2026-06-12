// MainNavigator.example.tsx — jak owinąć obecny stos zakładkami bottom tabs (Pixel Pop).
// Wzorzec do przeniesienia do src/navigation/MainNavigator.tsx.
// Gdy usePixelPop().enabled === false, użyj dotychczasowej nawigacji bez zakładek.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PixelPopTabBar } from '../components/ui-pixelpop';
import { usePixelPop } from '../contexts/pixelPopFlag.example'; // -> docelowo PixelPopContext

// Twoje istniejące ekrany:
import { ListsDashboardScreen } from '../features/shoppingLists/screens/ListsDashboardScreen';
import { ListDetailScreen } from '../features/shoppingLists/screens/ListDetailScreen';
// Nowe ekrany zakładek (z przykładów):
import { TemplatesScreen } from '../features/templates/screens/TemplatesScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Dotychczasowy stos z listami (Dashboard + Detail)
function ListsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListsDashboard" component={ListsDashboardScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
    </Stack.Navigator>
  );
}

export function MainNavigator() {
  const { enabled } = usePixelPop();

  // Stary wariant — bez zakładek
  if (!enabled) return <ListsStack />;

  // Pixel Pop — dolne zakładki z custom glass tab barem
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(p) => <PixelPopTabBar {...p} />}>
      <Tab.Screen name="Listy" component={ListsStack} />
      <Tab.Screen name="Szablony" component={TemplatesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default MainNavigator;
