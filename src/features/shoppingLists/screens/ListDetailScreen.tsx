import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Share, Alert, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AIInputBar, type ManualItemData } from '../../aiInput/components/AIInputBar';
import { PreviewModal } from '../../aiInput/components/PreviewModal';
import { useAIParser } from '../../aiInput/hooks/useAIParser';
import { PremiumGateModal } from '../../premium/components/PremiumGateModal';
import { PixelButton } from '../../../components/ui';
import { ThemePickerModal } from '../../../components/ThemePickerModal';
import { CategorySection } from '../components/CategorySection';
import { EditItemModal } from '../components/EditItemModal';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { useShoppingList } from '../hooks';
import type { CategoryGroup } from '../hooks/useShoppingList';
import { useAuth } from '../../auth/hooks';
import { isExpoGo } from '../../../utils/platform';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DraggableFlatList = !isExpoGo ? require('react-native-draggable-flatlist').default : null;
const ScaleDecorator = !isExpoGo ? require('react-native-draggable-flatlist').ScaleDecorator : null;
import { createInvite } from '../../../services/firebase/invites';
import type { ShoppingListsStackParamList } from '../../../types/navigation';
import type { ShoppingItem } from '../../../types/shoppingList';

type Props = NativeStackScreenProps<ShoppingListsStackParamList, 'ListDetail'>;

export function ListDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { listId } = route.params;
  const { user } = useAuth();
  const {
    list,
    isLoading,
    error,
    sortedCategories,
    handleAddItem,
    handleAddItems,
    handleToggleItem,
    handleRemoveItem,
    handleUpdateItem,
    handleReorderCategory,
    handleSetCategoryOrder,
    allCompleted,
    handleResetAll,
  } = useShoppingList(listId);

  const {
    parsedItems, isParsing, error: aiError, canRetry,
    limitReached, aiCallsRemaining, isPremium, hoursUntilReset,
    parse, retry, removeItem: removePreviewItem, clear: clearPreview,
  } = useAIParser();
  const [inputClearTrigger, setInputClearTrigger] = useState(0);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const showPreview = parsedItems.length > 0;

  useEffect(() => {
    if (!isLoading && !list) {
      navigation.goBack();
    }
  }, [isLoading, list, navigation]);

  useEffect(() => {
    if (limitReached) {
      setShowPremiumModal(true);
    }
  }, [limitReached]);

  const onAddManual = useCallback((item: ManualItemData) => {
    if (!user) return;
    handleAddItem({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      isCompleted: false,
      createdBy: user.id,
    });
  }, [user, handleAddItem]);

  const onConfirmItems = useCallback(() => {
    if (!user || parsedItems.length === 0) return;
    const items = parsedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      isCompleted: false,
      createdBy: user.id,
    }));
    handleAddItems(items);
    clearPreview();
    setInputClearTrigger((c) => c + 1);
  }, [user, parsedItems, handleAddItems, clearPreview]);

  const onShare = useCallback(async () => {
    if (!list || !user) return;
    try {
      let code = list.inviteCode;
      if (!code) {
        code = await createInvite(list.id, list.title, user.displayName, user.id);
      }
      await Share.share({
        message: `Dołącz do mojej listy zakupów "${list.title}" w Zing! Kod: ${code}`,
      });
    } catch {
      Alert.alert('Błąd', 'Nie udało się udostępnić listy.');
    }
  }, [list, user]);

  const onEditItem = useCallback((itemId: string) => {
    const item = list?.items.find((i) => i.id === itemId);
    if (item) setEditingItem(item);
  }, [list]);

  const onSaveEdit = useCallback((itemId: string, updates: { name: string; quantity: number; unit?: string; category: string }) => {
    handleUpdateItem(itemId, updates);
  }, [handleUpdateItem]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.accent} accessibilityLabel="Ładowanie listy" />
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

  const movableCategories = sortedCategories.filter((g) => g.category !== 'Kupione');
  const kupioneGroup = sortedCategories.find((g) => g.category === 'Kupione');

  return (
    <View style={[styles.container, { backgroundColor: theme.accentLight }]}>
      <View style={[styles.header, { backgroundColor: theme.accent, paddingTop: insets.top + SPACING.sm }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Wróć do list"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">{list.title}</Text>
        <Pressable
          onPress={() => setShowThemePicker(true)}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Wybierz motyw"
        >
          <MaterialCommunityIcons name="palette-outline" size={24} color={COLORS.white} />
        </Pressable>
      </View>

      {list.inviteCode && (
        <Pressable
          onPress={onShare}
          style={[styles.codeRow, { backgroundColor: theme.accent }]}
          accessibilityRole="button"
          accessibilityLabel={`Kod: ${list.inviteCode}. Udostępnij listę`}
        >
          <Text style={styles.codeLabel}>Kod: {list.inviteCode}</Text>
          <MaterialCommunityIcons name="share-variant-outline" size={20} color={COLORS.white} />
        </Pressable>
      )}

      {!list.inviteCode && list.ownerId === user?.id && (
        <Pressable
          onPress={onShare}
          style={[styles.codeRow, { backgroundColor: theme.accent, opacity: 0.8 }]}
          accessibilityRole="button"
          accessibilityLabel="Udostępnij listę"
        >
          <Text style={styles.codeLabel}>Udostępnij listę</Text>
          <MaterialCommunityIcons name="share-variant-outline" size={20} color={COLORS.white} />
        </Pressable>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <AIInputBar onParse={parse} onAddManual={onAddManual} isParsing={isParsing} clearTrigger={inputClearTrigger} />

        {!isPremium && (
          <Pressable
            onPress={() => setShowPremiumModal(true)}
            style={styles.aiQuotaRow}
            accessibilityRole="button"
            accessibilityLabel={aiCallsRemaining > 0 ? 'AI dostępne dziś. Kup Premium po nieograniczony dostęp.' : `Limit AI wyczerpany. Wróć za ${hoursUntilReset}h lub kup Premium.`}
          >
            <MaterialCommunityIcons name="robot-outline" size={14} color={aiCallsRemaining === 0 ? COLORS.danger : COLORS.disabled} />
            <Text style={[styles.aiQuotaText, aiCallsRemaining === 0 && styles.aiQuotaWarning]}>
              {aiCallsRemaining > 0
                ? 'AI: dostępne dziś'
                : `AI: wróć za ${hoursUntilReset}h — lub kup Premium`}
            </Text>
            <MaterialCommunityIcons name="crown-outline" size={14} color={COLORS.primary} />
          </Pressable>
        )}

        <PreviewModal
          visible={showPreview}
          items={parsedItems}
          onConfirm={onConfirmItems}
          onCancel={clearPreview}
          onRemoveItem={removePreviewItem}
        />

        {(error || aiError) && (
          <View style={styles.errorRow}>
            <Text style={styles.error}>{error || aiError}</Text>
            {canRetry && (
              <PixelButton
                title="Ponów"
                onPress={retry}
                style={styles.retryBtn}
                accessibilityLabel="Ponów zapytanie AI"
              />
            )}
          </View>
        )}

        {allCompleted && (
          <View style={[styles.completedBanner, { backgroundColor: theme.accent }]}>
            <View style={styles.completedRow}>
              <MaterialCommunityIcons name="check-circle-outline" size={28} color={COLORS.white} />
              <View style={styles.completedTextCol}>
                <Text style={styles.completedTitle}>Lista zrealizowana!</Text>
                <Text style={styles.completedSubtitle}>Wszystkie produkty kupione.</Text>
              </View>
            </View>
            <Pressable
              onPress={handleResetAll}
              style={styles.resetBtn}
              accessibilityRole="button"
              accessibilityLabel="Resetuj listę"
            >
              <Text style={[styles.resetBtnText, { color: theme.accent }]}>Resetuj listę</Text>
            </Pressable>
          </View>
        )}

        {list.items.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Lista jest pusta.</Text>
            <Text style={styles.emptyHint}>Użyj zakładki RĘCZNIE lub AI TEKST aby dodać produkty.</Text>
          </View>
        ) : !isExpoGo && DraggableFlatList ? (
          <DraggableFlatList
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.sm }]}
            data={movableCategories}
            keyExtractor={(item: CategoryGroup) => item.category}
            onDragEnd={({ data }: { data: CategoryGroup[] }) => {
              handleSetCategoryOrder(data.map((g) => g.category));
            }}
            ListFooterComponent={kupioneGroup ? (
              <CategorySection
                category={kupioneGroup.category}
                items={kupioneGroup.items}
                onToggle={handleToggleItem}
                onRemove={handleRemoveItem}
                onEdit={onEditItem}
              />
            ) : null}
            renderItem={({ item, drag }: { item: CategoryGroup; drag: () => void; isActive: boolean; getIndex: () => number | undefined }) => (
              <ScaleDecorator>
                <CategorySection
                  category={item.category}
                  items={item.items}
                  onToggle={handleToggleItem}
                  onRemove={handleRemoveItem}
                  onEdit={onEditItem}
                  drag={drag}
                />
              </ScaleDecorator>
            )}
          />
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.sm }]}>
            {sortedCategories.map((group) => {
              const isKupione = group.category === 'Kupione';
              const movableIdx = isKupione ? -1 : movableCategories.indexOf(group);
              return (
                <CategorySection
                  key={group.category}
                  category={group.category}
                  items={group.items}
                  onToggle={handleToggleItem}
                  onRemove={handleRemoveItem}
                  onEdit={onEditItem}
                  onMoveUp={isKupione ? undefined : () => handleReorderCategory(group.category, 'up')}
                  onMoveDown={isKupione ? undefined : () => handleReorderCategory(group.category, 'down')}
                  isFirst={movableIdx === 0}
                  isLast={isKupione || movableIdx === movableCategories.length - 1}
                />
              );
            })}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <EditItemModal
        visible={editingItem !== null}
        item={editingItem}
        onSave={onSaveEdit}
        onClose={() => setEditingItem(null)}
      />

      <PremiumGateModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        limitReached={limitReached}
      />

      <ThemePickerModal visible={showThemePicker} onClose={() => setShowThemePicker(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    minWidth: TOUCH.minTarget,
    minHeight: TOUCH.minTarget,
    borderWidth: BORDERS.width,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.white,
  },
  iconBtn: {
    minWidth: TOUCH.minTarget,
    minHeight: TOUCH.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDERS.width,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  codeLabel: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  aiQuotaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  aiQuotaText: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
  },
  aiQuotaWarning: {
    color: COLORS.danger,
    fontWeight: FONT_WEIGHT.bold,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
  },
  error: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.caption,
    flexShrink: 1,
  },
  retryBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
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
  emptyHint: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
    marginTop: SPACING.xs,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.sm,
  },
  completedBanner: {
    padding: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  completedTextCol: {
    flex: 1,
  },
  completedTitle: {
    fontSize: FONT_SIZE.h3,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  completedSubtitle: {
    fontSize: FONT_SIZE.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  resetBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderWidth: BORDERS.width,
    borderColor: COLORS.white,
    minHeight: TOUCH.minTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
  },
});
