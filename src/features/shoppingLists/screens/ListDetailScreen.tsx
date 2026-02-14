import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AddItemInput } from '../components/AddItemInput';
import { CategorySection } from '../components/CategorySection';
import { COLORS, SPACING, BORDERS } from '../../../constants';
import { useShoppingList } from '../hooks';
import { useAuth } from '../../auth/hooks';
import type { ShoppingListsStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<ShoppingListsStackParamList, 'ListDetail'>;

export function ListDetailScreen({ route, navigation }: Props) {
  const { listId } = route.params;
  const { user } = useAuth();
  const {
    list,
    isLoading,
    error,
    itemsByCategory,
    handleAddItem,
    handleToggleItem,
    handleRemoveItem,
  } = useShoppingList(listId);

  const onAdd = (name: string) => {
    if (!user) return;
    handleAddItem({
      name,
      quantity: 1,
      isCompleted: false,
      createdBy: user.id,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!list) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Lista nie istnieje.</Text>
      </View>
    );
  }

  const categories = Object.keys(itemsByCategory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{list.title}</Text>
        <Text style={styles.count}>
          {list.items.filter((i) => i.isCompleted).length}/{list.items.length}
        </Text>
      </View>

      <AddItemInput onAdd={onAdd} />

      {error && <Text style={styles.error}>{error}</Text>}

      {list.items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Lista jest pusta.</Text>
          <Text style={styles.emptyHint}>Dodaj pierwszy produkt powyżej.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {categories.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              items={itemsByCategory[cat]}
              onToggle={handleToggleItem}
              onRemove={handleRemoveItem}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.xl + SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderWidth: BORDERS.width,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
  },
  count: {
    fontSize: 14,
    color: COLORS.disabled,
  },
  error: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
    padding: SPACING.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.disabled,
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.disabled,
    marginTop: SPACING.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.sm,
  },
});
