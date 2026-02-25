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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard, PixelModal } from '../../../components/ui';
import { ThemePickerModal } from '../../../components/ThemePickerModal';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { useShoppingLists } from '../hooks';
import { useAuth } from '../../auth/hooks';
import { lookupInvite, joinList } from '../../../services/firebase/invites';
import type { ShoppingListsStackParamList } from '../../../types/navigation';
import type { ShoppingList } from '../../../types/shoppingList';

type Props = NativeStackScreenProps<ShoppingListsStackParamList, 'ListsDashboard'>;

function pluralize(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few;
  return many;
}

export function ListsDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, handleSignOut } = useAuth();
  const { lists, isLoading, error, handleCreate, handleDelete } = useShoppingLists();
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const onJoinByCode = async () => {
    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length !== 6 || !user) return;

    setIsJoining(true);
    try {
      const invite = await lookupInvite(trimmed);

      if (!invite) {
        Alert.alert('Błąd', 'Nieprawidłowy kod zaproszenia.');
        setIsJoining(false);
        return;
      }

      if (lists.some((l) => l.id === invite.listId)) {
        Alert.alert('Info', 'Jesteś już członkiem tej listy.');
        setJoinCode('');
        setIsJoining(false);
        setShowJoinModal(false);
        return;
      }

      Alert.alert(
        'Dołącz do listy',
        `Dołączyć do "${invite.listTitle}" (od ${invite.ownerName})?`,
        [
          { text: 'Anuluj', style: 'cancel', onPress: () => setIsJoining(false) },
          {
            text: 'Dołącz',
            onPress: async () => {
              try {
                await joinList(invite.listId, user.id);
                setJoinCode('');
                setShowJoinModal(false);
              } catch {
                Alert.alert('Błąd', 'Nie udało się dołączyć do listy.');
              }
              setIsJoining(false);
            },
          },
        ],
      );
    } catch {
      Alert.alert('Błąd', 'Nie udało się sprawdzić kodu.');
      setIsJoining(false);
    }
  };

  const onCreateList = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setIsCreating(true);
    const listId = await handleCreate(trimmed);
    setIsCreating(false);
    if (listId) {
      setNewTitle('');
      setShowCreateModal(false);
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
    const allCompleted = item.items.length > 0 && item.items.every((i) => i.isCompleted);

    return (
      <Pressable
        onPress={() => navigation.navigate('ListDetail', { listId: item.id })}
        onLongPress={() => onDeleteList(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${allCompleted ? 'zrealizowana' : `${item.items.length} produktów`}`}
        accessibilityHint="Otwórz listę zakupów. Przytrzymaj aby usunąć."
      >
        <PixelCard style={styles.listCard}>
          <View style={styles.listRow}>
            <MaterialCommunityIcons
              name={allCompleted ? 'check-circle' : 'cart-outline'}
              size={24}
              color={allCompleted ? theme.accent : COLORS.primary}
              style={styles.cartIcon}
            />
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={[styles.listMeta, allCompleted && { color: theme.accent }]}>
                {allCompleted ? 'Zrealizowana' : `Produkty: ${item.items.length}`}
              </Text>
            </View>
            {item.inviteCode && (
              <View style={[styles.codeBadge, { backgroundColor: theme.accent }]}>
                <Text style={styles.codeBadgeText}>{item.inviteCode}</Text>
              </View>
            )}
          </View>
        </PixelCard>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.accentLight }]}>
      <View style={[styles.header, { backgroundColor: theme.accent, paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Moje listy</Text>
          <Text style={styles.headerSubtitle}>
            {lists.length} {pluralize(lists.length, 'lista', 'listy', 'list')}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => setShowThemePicker(true)}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Wybierz motyw"
          >
            <MaterialCommunityIcons name="palette-outline" size={24} color={COLORS.white} />
          </Pressable>
          <PixelButton
            title="Wyloguj"
            onPress={handleSignOut}
            variant="danger"
            icon={<MaterialCommunityIcons name="logout" size={16} color={COLORS.white} />}
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={() => setShowCreateModal(true)}
          style={[styles.actionCard, { backgroundColor: theme.accent }]}
          accessibilityRole="button"
          accessibilityLabel="Nowa lista"
        >
          <MaterialCommunityIcons name="plus" size={32} color={COLORS.white} />
          <Text style={styles.actionText}>Nowa lista</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowJoinModal(true)}
          style={[styles.actionCard, { backgroundColor: theme.accent }]}
          accessibilityRole="button"
          accessibilityLabel="Dołącz do listy"
        >
          <MaterialCommunityIcons name="account-plus-outline" size={32} color={COLORS.white} />
          <Text style={styles.actionText}>Dołącz do listy</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.accent} accessibilityLabel="Ładowanie list" />
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

      <PixelModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nowa lista">
        <PixelInput
          placeholder="Nazwa listy"
          value={newTitle}
          onChangeText={setNewTitle}
          onSubmitEditing={onCreateList}
          returnKeyType="done"
          accessibilityLabel="Nazwa nowej listy"
        />
        <View style={styles.modalButtons}>
          <PixelButton title="Utwórz" onPress={onCreateList} disabled={isCreating || !newTitle.trim()} style={styles.modalBtn} />
          <PixelButton title="Anuluj" onPress={() => { setShowCreateModal(false); setNewTitle(''); }} variant="accentMuted" style={styles.modalBtn} />
        </View>
      </PixelModal>

      <PixelModal visible={showJoinModal} onClose={() => setShowJoinModal(false)} title="Dołącz do listy">
        <PixelInput
          placeholder="Wpisz kod"
          value={joinCode}
          onChangeText={setJoinCode}
          onSubmitEditing={onJoinByCode}
          returnKeyType="done"
          maxLength={6}
          autoCapitalize="characters"
          accessibilityLabel="Kod zaproszenia do listy"
        />
        <View style={styles.modalButtons}>
          <PixelButton title="Dołącz" onPress={onJoinByCode} disabled={isJoining || joinCode.trim().length !== 6} style={styles.modalBtn} />
          <PixelButton title="Anuluj" onPress={() => { setShowJoinModal(false); setJoinCode(''); }} variant="accentMuted" style={styles.modalBtn} />
        </View>
      </PixelModal>

      <ThemePickerModal visible={showThemePicker} onClose={() => setShowThemePicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerLeft: {},
  headerTitle: {
    fontSize: FONT_SIZE.h1,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconBtn: {
    minWidth: TOUCH.minTarget,
    minHeight: TOUCH.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDERS.width,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
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
  cartIcon: {
    marginRight: SPACING.sm,
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
  codeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
  },
  codeBadgeText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  modalBtn: {
    flex: 1,
  },
});
