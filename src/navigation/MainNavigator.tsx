import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ListsDashboardScreen } from '../features/shoppingLists/screens/ListsDashboardScreen';
import { ListDetailScreen } from '../features/shoppingLists/screens/ListDetailScreen';
import { PixelPopTemplatesScreen } from '../features/templates/screens/PixelPopTemplatesScreen';
import { PixelPopProfileScreen } from '../features/auth/screens/PixelPopProfileScreen';
import { PixelPopTabBar } from '../components/ui-pixelpop';
import { useIAPInit } from '../features/premium';
import { useTheme } from '../contexts/ThemeContext';
import type { ShoppingListsStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ShoppingListsStackParamList>();
const Tab = createBottomTabNavigator();

function ListsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListsDashboard" component={ListsDashboardScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
    </Stack.Navigator>
  );
}

function PixelPopTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <PixelPopTabBar {...props} />}
    >
      <Tab.Screen name="Listy" component={ListsStack} />
      <Tab.Screen name="Szablony" component={PixelPopTemplatesScreen} />
      <Tab.Screen name="Profil" component={PixelPopProfileScreen} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  useIAPInit();
  const { pixelPopEnabled } = useTheme();

  if (pixelPopEnabled) {
    return <PixelPopTabs />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListsDashboard" component={ListsDashboardScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
    </Stack.Navigator>
  );
}
