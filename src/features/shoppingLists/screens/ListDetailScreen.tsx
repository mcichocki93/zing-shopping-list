import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Share, Alert, StyleSheet, Pressable, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { AIInputBar, type ManualItemData } from '../../aiInput/components/AIInputBar';
import { PreviewModal } from '../../aiInput/components/PreviewModal';
import { useAIParser } from '../../aiInput/hooks/useAIParser';
import { useSpeechInput } from '../../aiInput/hooks/useSpeechInput';
import type { AIParsedItem } from '../../../types/ai';
import { PremiumGateModal } from '../../premium/components/PremiumGateModal';
import { PixelButton } from '../../../components/ui';
import { OfflineBanner } from '../../../components/OfflineBanner';
import { ThemePickerModal } from '../../../components/ThemePickerModal';
import { CategorySection } from '../components/CategorySection';
import { EditItemModal } from '../components/EditItemModal';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { useShoppingList } from '../hooks';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../../constants/pixelPopTheme';
import { HardShadow, SegmentProgress, CategoryCard, ComposeBar, PixelIcon } from '../../../components/ui-pixelpop';
import type { CategoryGroup } from '../hooks/useShoppingList';
import { useAuth } from '../../auth/hooks';
import { isExpoGo } from '../../../utils/platform';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DraggableFlatList = !isExpoGo ? require('react-native-draggable-flatlist').default : null;
const ScaleDecorator = !isExpoGo ? require('react-native-draggable-flatlist').ScaleDecorator : null;
import { createInvite } from '../../../services/firebase/invites';
import { useTemplates } from '../../templates';
import type { ShoppingListsStackParamList } from '../../../types/navigation';
import type { ShoppingItem } from '../../../types/shoppingList';

type Props = NativeStackScreenProps<ShoppingListsStackParamList, 'ListDetail'>;

export function ListDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme, pixelPopEnabled, pixelPopAccent } = useTheme();
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
  const { handleSave: saveTemplate } = useTemplates({ load: false });
  const [inputClearTrigger, setInputClearTrigger] = useState(0);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [inputCollapsed, setInputCollapsed] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
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
        message: `Dołącz do mojej listy zakupów "${list.title}" w Zing!
Link: zing://join/${code}
Lub wpisz kod: ${code}`,
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

  const onSaveAsTemplate = useCallback(async () => {
    if (!list) return;
    const name = templateName.trim();
    if (!name) return;
    setIsSavingTemplate(true);
    const items = list.items
      .filter((i) => !i.isCompleted)
      .map(({ name: n, quantity, unit, category }) => ({
        name: n,
        quantity,
        ...(unit !== undefined ? { unit } : {}),
        ...(category !== undefined ? { category } : {}),
      }));
    const saved = await saveTemplate(name, items);
    setIsSavingTemplate(false);
    if (!saved) {
      Alert.alert('Błąd', 'Nie udało się zapisać szablonu. Spróbuj ponownie.');
      return;
    }
    setShowSaveTemplate(false);
    setTemplateName('');
    Alert.alert('Szablon zapisany', `"${name}" został zapisany jako szablon.`);
  }, [list, templateName, saveTemplate]);

  const renderDraggableItem = useCallback(
    ({ item, drag }: { item: CategoryGroup; drag: () => void; isActive: boolean; getIndex: () => number | undefined }) => (
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
    ),
    [handleToggleItem, handleRemoveItem, onEditItem],
  );

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

  if (pixelPopEnabled) {
    return (
      <PixelPopDetailView
        list={list}
        groups={sortedCategories}
        accent={pixelPopAccent}
        onBack={() => navigation.goBack()}
        onShare={onShare}
        onMenu={() => {
          if (!isPremium) { setShowPremiumModal(true); return; }
          setTemplateName(list?.title ?? '');
          setShowSaveTemplate(true);
        }}
        onToggle={handleToggleItem}
        onEdit={onEditItem}
        isParsing={isParsing}
        onParse={parse}
        onAddManual={onAddManual}
        onConfirmItems={onConfirmItems}
        parsedItems={parsedItems}
        clearPreview={clearPreview}
        removePreviewItem={removePreviewItem}
        inputClearTrigger={inputClearTrigger}
        setInputClearTrigger={setInputClearTrigger}
        insets={insets}
        allCompleted={allCompleted}
        onResetAll={handleResetAll}
        aiError={aiError}
        canRetry={canRetry}
        onRetry={retry}
        aiCallsRemaining={aiCallsRemaining}
        hoursUntilReset={hoursUntilReset}
        isPremium={isPremium}
        onOpenPremium={() => setShowPremiumModal(true)}
      >
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
        {showSaveTemplate && (
          <View style={styles.templateOverlay}>
            <View style={styles.templateModal}>
              <Text style={styles.templateTitle}>Zapisz jako szablon</Text>
              <TextInput
                style={styles.templateInput}
                value={templateName}
                onChangeText={setTemplateName}
                placeholder="Nazwa szablonu"
                autoFocus
                maxLength={100}
                returnKeyType="done"
                onSubmitEditing={onSaveAsTemplate}
              />
              <View style={styles.templateButtons}>
                <PixelButton
                  title={isSavingTemplate ? 'Zapisuję...' : 'Zapisz'}
                  onPress={onSaveAsTemplate}
                  disabled={isSavingTemplate || !templateName.trim()}
                  style={styles.templateBtn}
                />
                <PixelButton
                  title="Anuluj"
                  onPress={() => { setShowSaveTemplate(false); setTemplateName(''); }}
                  variant="accentMuted"
                  style={styles.templateBtn}
                />
              </View>
            </View>
          </View>
        )}
      </PixelPopDetailView>
    );
  }

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
          onPress={() => {
            if (!isPremium) { setShowPremiumModal(true); return; }
            setTemplateName(list?.title ?? '');
            setShowSaveTemplate(true);
          }}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Zapisz jako szablon"
        >
          <MaterialCommunityIcons name="content-save-outline" size={24} color={COLORS.white} />
        </Pressable>
        <Pressable
          onPress={() => setShowThemePicker(true)}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Wybierz motyw"
        >
          <MaterialCommunityIcons name="palette-outline" size={24} color={COLORS.white} />
        </Pressable>
      </View>

      <OfflineBanner />
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
        {!inputCollapsed && (
          <>
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
          </>
        )}

        <Pressable
          onPress={() => setInputCollapsed((c) => !c)}
          style={[styles.collapseToggle, { backgroundColor: theme.accentLight }]}
          accessibilityRole="button"
          accessibilityLabel={inputCollapsed ? 'Rozwiń dodawanie produktów' : 'Zwiń dodawanie produktów'}
        >
          <MaterialCommunityIcons
            name={inputCollapsed ? 'chevron-down' : 'chevron-up'}
            size={16}
            color={COLORS.disabled}
          />
        </Pressable>

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
          <View style={styles.scroll}>
            <DraggableFlatList
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
              renderItem={renderDraggableItem}
            />
          </View>
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

      {showSaveTemplate && (
        <View style={styles.templateOverlay}>
          <View style={styles.templateModal}>
            <Text style={styles.templateTitle}>Zapisz jako szablon</Text>
            <TextInput
              style={styles.templateInput}
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="Nazwa szablonu"
              autoFocus
              maxLength={100}
              returnKeyType="done"
              onSubmitEditing={onSaveAsTemplate}
            />
            <View style={styles.templateButtons}>
              <PixelButton
                title={isSavingTemplate ? 'Zapisuję...' : 'Zapisz'}
                onPress={onSaveAsTemplate}
                disabled={isSavingTemplate || !templateName.trim()}
                style={styles.templateBtn}
              />
              <PixelButton
                title="Anuluj"
                onPress={() => { setShowSaveTemplate(false); setTemplateName(''); }}
                variant="accentMuted"
                style={styles.templateBtn}
              />
            </View>
          </View>
        </View>
      )}
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
  collapseToggle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
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
  templateOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  templateModal: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    width: '100%',
    gap: SPACING.sm,
  },
  templateTitle: {
    fontSize: FONT_SIZE.h3,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  templateInput: {
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONT_SIZE.body,
    color: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  templateButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  templateBtn: {
    flex: 1,
  },
});

// ─── Pixel Pop Detail View ──────────────────────────────────────────────────

interface PixelPopDetailViewProps {
  list: NonNullable<ReturnType<typeof useShoppingList>['list']>;
  groups: CategoryGroup[];
  accent: string;
  onBack: () => void;
  onShare: () => void;
  onMenu: () => void;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  isParsing: boolean;
  onParse: (text: string) => void;
  onAddManual: (item: ManualItemData) => void;
  onConfirmItems: () => void;
  parsedItems: AIParsedItem[];
  clearPreview: () => void;
  removePreviewItem: (index: number) => void;
  inputClearTrigger: number;
  setInputClearTrigger: React.Dispatch<React.SetStateAction<number>>;
  insets: { top: number; bottom: number };
  allCompleted: boolean;
  onResetAll: () => void;
  aiError: string | null;
  canRetry: boolean;
  onRetry: () => void;
  aiCallsRemaining: number;
  hoursUntilReset: number | null;
  isPremium: boolean;
  onOpenPremium: () => void;
  children?: React.ReactNode;
}

function PixelPopDetailView({
  list, groups, accent,
  onBack, onShare, onMenu,
  onToggle, onEdit,
  isParsing, onParse, onAddManual, onConfirmItems,
  parsedItems, clearPreview, removePreviewItem, inputClearTrigger, setInputClearTrigger,
  insets, allCompleted, onResetAll,
  aiError, canRetry, onRetry,
  aiCallsRemaining, hoursUntilReset, isPremium, onOpenPremium,
  children,
}: PixelPopDetailViewProps) {
  const tabBarHeight = useBottomTabBarHeight();
  const [mode, setMode] = useState(0); // 0=AI, 1=manual
  const [composeText, setComposeText] = useState('');
  const { isListening, transcript, startListening, stopListening, clearTranscript } = useSpeechInput();
  const sessionBaseRef = useRef('');
  const showPreview = parsedItems.length > 0;

  useEffect(() => {
    if (!transcript) return;
    const base = sessionBaseRef.current.trim();
    setComposeText(base ? base + ' ' + transcript : transcript);
  }, [transcript]);

  useEffect(() => {
    if (inputClearTrigger > 0) {
      setComposeText('');
      clearTranscript();
    }
  }, [inputClearTrigger, clearTranscript]);

  const handleMicPressIn = async () => {
    sessionBaseRef.current = composeText;
    clearTranscript();
    await startListening();
  };

  const handleSend = () => {
    if (mode === 0) {
      const t = composeText.trim();
      if (!t || isParsing) return;
      onParse(t);
    }
  };

  const allItems = groups.flatMap((g) => g.items);
  const done = allItems.filter((i) => i.isCompleted).length;
  const total = allItems.length;

  function categoryIcon(cat: string): string {
    const map: Record<string, string> = {
      'Owoce i warzywa': 'apple', 'Nabiał': 'milk', 'Pieczywo': 'bread', 'Napoje': 'drink',
    };
    return map[cat] ?? 'cart';
  }

  return (
    <View style={{ flex: 1, backgroundColor: PP.paper }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: tabBarHeight + 170 }}>
        {/* Nav */}
        <View style={ppDetailStyles.nav}>
          <Pressable onPress={onBack} style={ppDetailStyles.iconBtn} accessibilityLabel="Wróć">
            <PixelIcon name="chevronL" size={16} color={PP.ink} />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={onShare} style={ppDetailStyles.iconBtn} accessibilityLabel="Udostępnij">
              <PixelIcon name="share" size={14} color={PP.ink} />
            </Pressable>
            <Pressable onPress={onMenu} style={ppDetailStyles.iconBtn} accessibilityLabel="Menu">
              <PixelIcon name="menu" size={14} color={PP.ink} />
            </Pressable>
          </View>
        </View>

        {/* Title + meta */}
        <View style={{ paddingHorizontal: 18, paddingTop: 8 }}>
          <Text style={ppText.title}>{list.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
            {list.inviteCode ? (
              <Text style={ppDetailStyles.code}>KOD · {list.inviteCode}</Text>
            ) : null}
            <Text style={ppText.meta}>{list.memberIds.length} {list.memberIds.length === 1 ? 'osoba' : 'osoby'}</Text>
            <Text style={ppText.meta}>{done}/{total}</Text>
          </View>
        </View>

        {/* Progress card */}
        <View style={{ paddingHorizontal: 16, marginTop: 14, marginBottom: 16 }}>
          <HardShadow offset={4}>
            <View style={ppDetailStyles.progressCard}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={ppText.catLabel}>POSTĘP</Text>
                <Text style={{ fontFamily: PP_FONT.display, fontSize: 16, color: PP.ink }}>
                  {done}<Text style={{ fontSize: 10, color: PP.muted }}>/{total}</Text>
                </Text>
              </View>
              <SegmentProgress total={Math.max(total, 1)} done={done} height={10} fill={accent} empty="#EFE7DA" gap={3} />
            </View>
          </HardShadow>
        </View>

        {/* Completed banner */}
        {allCompleted && (
          <View style={[ppDetailStyles.completedBanner, { backgroundColor: accent }]}>
            <Text style={{ fontFamily: PP_FONT.display, fontSize: 12, color: PP.ink }}>✓ LISTA ZREALIZOWANA!</Text>
            <Pressable onPress={onResetAll} style={ppDetailStyles.resetBtn} accessibilityLabel="Resetuj listę">
              <Text style={{ fontFamily: PP_FONT.uiSemi, fontSize: 12, color: PP.ink }}>Resetuj listę</Text>
            </Pressable>
          </View>
        )}

        {/* AI errors */}
        {aiError ? (
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <Text style={{ color: '#FF3B30', fontSize: 12, fontFamily: PP_FONT.uiSemi }}>{aiError}</Text>
          </View>
        ) : null}

        {/* Category groups */}
        <View style={{ paddingHorizontal: 16, gap: 14 }}>
          {groups.map((g) => (
            <CategoryCard
              key={g.category}
              category={g.category}
              icon={categoryIcon(g.category)}
              items={g.items.map((i) => ({
                id: i.id,
                name: i.name,
                quantity: i.quantity,
                unit: i.unit,
                isCompleted: i.isCompleted,
              }))}
              onToggle={onToggle}
              onEdit={onEdit}
            />
          ))}
          {groups.length === 0 && (
            <Text style={[ppText.meta, { textAlign: 'center', marginTop: 24 }]}>Lista jest pusta. Dodaj produkty poniżej.</Text>
          )}
        </View>
      </ScrollView>

      {/* Preview modal for AI results */}
      <PreviewModal
        visible={showPreview}
        items={parsedItems}
        onConfirm={onConfirmItems}
        onCancel={clearPreview}
        onRemoveItem={removePreviewItem}
      />

      {/* Compose bar — positioned above the tab bar */}
      <ComposeBar
        mode={mode}
        onModeChange={setMode}
        value={composeText}
        onChangeText={setComposeText}
        onSend={handleSend}
        onMicPressIn={handleMicPressIn}
        onMicPressOut={stopListening}
        accent={accent}
        placeholder={mode === 0 ? (isListening ? 'Słucham...' : '2x mleko, chleb, jabłka…') : 'Nazwa produktu'}
        style={{ bottom: tabBarHeight + 8 }}
      />

      {children}
    </View>
  );
}

const ppDetailStyles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 4 },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
  code: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: PP.paper, backgroundColor: PP.ink, paddingHorizontal: 6, paddingVertical: 3 },
  progressCard: { backgroundColor: PP.panel, borderWidth: PP_BORDER.thick, borderColor: PP.ink, padding: 12 },
  completedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 16, paddingHorizontal: 14, paddingVertical: 12, borderWidth: PP_BORDER.thick, borderColor: PP.ink },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: PP.paper, borderWidth: PP_BORDER.thin, borderColor: PP.ink },
});
