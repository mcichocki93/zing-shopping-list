import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ListsDashboardScreen } from '../features/shoppingLists/screens/ListsDashboardScreen';
import { ListDetailScreen } from '../features/shoppingLists/screens/ListDetailScreen';
import type { ShoppingListsStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ShoppingListsStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListsDashboard" component={ListsDashboardScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
    </Stack.Navigator>
  );
}
