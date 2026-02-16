import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard } from '../../../components/ui';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useShoppingLists } from '../hooks';
import { useAuth } from '../../auth/hooks';
import type { ShoppingListsStackParamList } from '../../../types/navigation';
import type { ShoppingList } from '../../../types/shoppingList';

type Props = NativeStackScreenProps<ShoppingListsStackParamList, 'ListsDashboard'>;

export function ListsDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, handleSignOut } = useAuth();
  const { lists, isLoading, error, handleCreate, handleDelete } = useShoppingLists();
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const onCreateList = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setIsCreating(true);
    const listId = await handleCreate(trimmed);
    setIsCreating(false);
    if (listId) {
      setNewTitle('');
      navigation.navigate('ListDetail', { listId });
    }
  };

  const onDeleteList = (list: ShoppingList) => {
    if (list.ownerId !== user?.id) return;
    Alert.alert(
      'Usuń listę',
      `Usunąć "${list.title}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => handleDelete(list.id),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: ShoppingList }) => {
    const itemCount = item.items.length;
    const completedCount = item.items.filter((i) => i.isCompleted).length;

    return (
      <Pressable
        onPress={() => navigation.navigate('ListDetail', { listId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${completedCount} z ${itemCount} produktów kupione`}
        accessibilityHint="Otwórz listę zakupów"
      >
        <PixelCard style={styles.listCard}>
          <View style={styles.listRow}>
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.listMeta}>
                {completedCount}/{itemCount} produktów
              </Text>
            </View>
            {item.ownerId === user?.id && (
              <Pressable
                onPress={() => onDeleteList(item)}
                style={styles.deleteBtn}
                accessibilityRole="button"
                accessibilityLabel={`Usuń listę ${item.title}`}
              >
                <Text style={styles.deleteText}>X</Text>
              </Pressable>
            )}
          </View>
        </PixelCard>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.title}>Zing</Text>
        <Text style={styles.greeting}>Cześć, {user?.displayName}!</Text>
      </View>

      <View style={styles.createRow}>
        <PixelInput
          placeholder="Nazwa nowej listy..."
          value={newTitle}
          onChangeText={setNewTitle}
          onSubmitEditing={onCreateList}
          returnKeyType="done"
          style={styles.createInput}
          accessibilityLabel="Nazwa nowej listy"
          accessibilityHint="Wpisz nazwę i naciśnij Utwórz"
        />
        <PixelButton
          title="Utwórz"
          accessibilityLabel="Utwórz nową listę"
          onPress={onCreateList}
          disabled={isCreating || !newTitle.trim()}
          style={styles.createBtn}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} accessibilityLabel="Ładowanie list" />
        </View>
      ) : lists.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Brak list. Utwórz pierwszą!</Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.sm }]}>
        <PixelButton
          title="Wyloguj"
          onPress={handleSignOut}
          variant="danger"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.white,
  },
  greeting: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    marginTop: SPACING.xs,
  },
  createRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
  },
  createInput: {
    flex: 1,
  },
  createBtn: {
    paddingHorizontal: SPACING.md,
  },
  error: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.caption,
    textAlign: 'center',
    padding: SPACING.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.body,
    color: COLORS.disabled,
  },
  listContent: {
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  listCard: {
    padding: SPACING.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: FONT_SIZE.h3,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  listMeta: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    marginTop: SPACING.xs,
  },
  deleteBtn: {
    minWidth: TOUCH.minTarget,
    minHeight: TOUCH.minTarget,
    borderWidth: BORDERS.width,
    borderColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.danger,
  },
  footer: {
    padding: SPACING.sm,
    borderTopWidth: BORDERS.width,
    borderTopColor: COLORS.border,
  },
});
