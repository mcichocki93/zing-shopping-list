import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PixelButton, PixelInput, PixelCard, PixelModal } from '../../../components/ui';
import { ThemePickerModal } from '../../../components/ThemePickerModal';
import { CategoryManagerModal } from '../../categories';
import { TemplatePickerModal, TemplateManagerModal, useTemplates, type ListTemplate, type TemplateItem } from '../../templates';
import { PremiumGateModal } from '../../premium/components/PremiumGateModal';
import { usePremium } from '../../premium/hooks/usePremium';
import { OfflineBanner } from '../../../components/OfflineBanner';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { useShoppingLists } from '../hooks';
import { useAuth } from '../../auth/hooks';
import { lookupInvite, joinList } from '../../../services/firebase/invites';
import { addItems } from '../../../services/firebase/shoppingLists';
import type { ShoppingListsStackParamList } from '../../../types/navigation';
import type { ShoppingList } from '../../../types/shoppingList';

type Props = NativeStackScreenProps<ShoppingListsStackParamList, 'ListsDashboard'>;

function pluralize(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few;
  return many;
}

export function ListsDashboardScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, handleSignOut, handleDeleteAccount, isLoading: isAuthLoading } = useAuth();
  const { lists, isLoading, error, handleCreate, handleDelete, handleReorder } = useShoppingLists();
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showTemplatesPremium, setShowTemplatesPremium] = useState(false);
  const { isPremium } = usePremium();
  const { templates, isLoading: isLoadingTemplates } = useTemplates();
  const deepLinkHandled = useRef(false);

  // Handle incoming deep link: zing://join/CODE
  useEffect(() => {
    const code = route.params?.inviteCode;
    if (!code || deepLinkHandled.current || !user) return;
    deepLinkHandled.current = true;
    setJoinCode(code.toUpperCase());
    setShowJoinModal(true);
  }, [route.params?.inviteCode, user]);

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

  const onCreateFromTemplate = async (template: ListTemplate) => {
    if (!user) return;
    const listId = await handleCreate(template.name);
    if (!listId || template.items.length === 0) {
      if (listId) navigation.navigate('ListDetail', { listId });
      return;
    }
    const itemsToAdd = template.items.map((item: TemplateItem) => ({
      name: item.name,
      quantity: item.quantity,
      ...(item.unit !== undefined ? { unit: item.unit } : {}),
      ...(item.category !== undefined ? { category: item.category } : {}),
      isCompleted: false,
      createdBy: user.id,
    }));
    await addItems(listId, itemsToAdd);
    navigation.navigate('ListDetail', { listId });
  };

  const onDeleteAccount = () => {
    Alert.alert(
      'Usuń konto',
      'Spowoduje to trwałe usunięcie Twojego konta i wszystkich danych. Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń konto',
          style: 'destructive',
          onPress: async () => {
            setShowSettings(false);
            await handleDeleteAccount();
          },
        },
      ],
    );
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

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ShoppingList>) => {
    const allCompleted = item.items.length > 0 && item.items.every((i) => i.isCompleted);

    return (
      <ScaleDecorator>
        <Pressable
          onPress={() => !isActive && navigation.navigate('ListDetail', { listId: item.id })}
          onLongPress={drag}
          delayLongPress={200}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${allCompleted ? 'zrealizowana' : `${item.items.length} produktów`}`}
          accessibilityHint="Otwórz listę zakupów. Przytrzymaj aby zmienić kolejność."
        >
          <PixelCard style={isActive ? { ...styles.listCard, ...styles.listCardDragging } : styles.listCard}>
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
              {item.ownerId === user?.id && (
                <Pressable
                  onPress={() => onDeleteList(item)}
                  style={styles.deleteBtn}
                  accessibilityLabel={`Usuń ${item.title}`}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.danger} />
                </Pressable>
              )}
              <MaterialCommunityIcons name="drag-horizontal-variant" size={20} color={COLORS.disabled} style={styles.dragHandle} />
            </View>
          </PixelCard>
        </Pressable>
      </ScaleDecorator>
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
          <Pressable
            onPress={() => setShowSettings(true)}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Ustawienia"
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color={COLORS.white} />
          </Pressable>
          <PixelButton
            title="Wyloguj"
            onPress={handleSignOut}
            variant="danger"
            icon={<MaterialCommunityIcons name="logout" size={16} color={COLORS.white} />}
          />
        </View>
      </View>
      <OfflineBanner />

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
        <Pressable
          onPress={() => {
            if (!isPremium) { setShowTemplatesPremium(true); return; }
            setShowTemplatePicker(true);
          }}
          style={[styles.actionCard, { backgroundColor: theme.accent }]}
          accessibilityRole="button"
          accessibilityLabel="Utwórz listę z szablonu"
        >
          <MaterialCommunityIcons name="file-outline" size={32} color={COLORS.white} />
          <Text style={styles.actionText}>Z szablonu</Text>
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
        <DraggableFlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => handleReorder(data.map((l) => l.id))}
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

      <CategoryManagerModal
        visible={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />

      <TemplatePickerModal
        visible={showTemplatePicker}
        templates={templates}
        isLoading={isLoadingTemplates}
        onSelect={onCreateFromTemplate}
        onClose={() => setShowTemplatePicker(false)}
      />

      <TemplateManagerModal
        visible={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
      />

      <PremiumGateModal
        visible={showTemplatesPremium}
        onClose={() => setShowTemplatesPremium(false)}
        limitReached={false}
      />

      <PixelModal visible={showSettings} onClose={() => setShowSettings(false)} title="Ustawienia">
        <Pressable
          onPress={() => { setShowSettings(false); setShowCategoryManager(true); }}
          style={styles.settingsRow}
          accessibilityRole="button"
          accessibilityLabel="Zarządzaj kategoriami"
        >
          <MaterialCommunityIcons name="tag-multiple-outline" size={20} color={COLORS.primary} />
          <Text style={styles.settingsRowText}>Zarządzaj kategoriami</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.disabled} />
        </Pressable>
        <Pressable
          onPress={() => { setShowSettings(false); setShowTemplateManager(true); }}
          style={styles.settingsRow}
          accessibilityRole="button"
          accessibilityLabel="Zarządzaj szablonami"
        >
          <MaterialCommunityIcons name="file-outline" size={20} color={COLORS.primary} />
          <Text style={styles.settingsRowText}>Szablony list</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.disabled} />
        </Pressable>
        <View style={styles.settingsDivider} />
        <Pressable
          onPress={() => Linking.openURL('https://mcichocki93.github.io/zing-shopping-list/privacy-policy')}
          style={styles.settingsRow}
          accessibilityRole="link"
          accessibilityLabel="Polityka prywatności"
        >
          <MaterialCommunityIcons name="shield-account-outline" size={20} color={COLORS.primary} />
          <Text style={styles.settingsRowText}>Polityka prywatności</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.disabled} />
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL('https://mcichocki93.github.io/zing-shopping-list/delete-account')}
          style={styles.settingsRow}
          accessibilityRole="link"
          accessibilityLabel="Usuń konto (strona)"
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color={COLORS.primary} />
          <Text style={styles.settingsRowText}>Usuń konto (przez stronę)</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.disabled} />
        </Pressable>
        <View style={styles.settingsDivider} />
        <PixelButton
          title={isAuthLoading ? 'Usuwanie...' : 'USUŃ KONTO'}
          onPress={onDeleteAccount}
          variant="danger"
          disabled={isAuthLoading}
          icon={<MaterialCommunityIcons name="delete-forever" size={16} color={COLORS.white} />}
          accessibilityLabel="Usuń konto i wszystkie dane"
        />
        <PixelButton
          title="Zamknij"
          onPress={() => setShowSettings(false)}
          variant="accentMuted"
          style={styles.settingsClose}
        />
      </PixelModal>
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
  listCardDragging: {
    opacity: 0.85,
    borderColor: COLORS.primary,
  },
  dragHandle: {
    marginLeft: SPACING.xs,
  },
  deleteBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
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
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH.minTarget,
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  settingsRowText: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  settingsDivider: {
    height: BORDERS.width,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  settingsClose: {
    marginTop: SPACING.sm,
  },
});
