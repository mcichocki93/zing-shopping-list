import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AIInputBar } from '../../aiInput/components/AIInputBar';
import { PreviewModal } from '../../aiInput/components/PreviewModal';
import { useAIParser } from '../../aiInput/hooks/useAIParser';
import { PixelButton } from '../../../components/ui';
import { CategorySection } from '../components/CategorySection';
import { COLORS, SPACING, BORDERS, TOUCH, FONT_SIZE, FONT_WEIGHT } from '../../../constants';
import { useShoppingList } from '../hooks';
import { useAuth } from '../../auth/hooks';
import type { ShoppingListsStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<ShoppingListsStackParamList, 'ListDetail'>;

export function ListDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { listId } = route.params;
  const { user } = useAuth();
  const {
    list,
    isLoading,
    error,
    itemsByCategory,
    handleAddItem,
    handleAddItems,
    handleToggleItem,
    handleRemoveItem,
  } = useShoppingList(listId);

  const { parsedItems, isParsing, error: aiError, canRetry, parse, retry, removeItem: removePreviewItem, clear: clearPreview } = useAIParser();
  const [inputClearTrigger, setInputClearTrigger] = useState(0);
  const showPreview = parsedItems.length > 0;

  // Navigate back when list is deleted (becomes null after initial load)
  useEffect(() => {
    if (!isLoading && !list) {
      navigation.goBack();
    }
  }, [isLoading, list, navigation]);

  const onAddManual = useCallback((name: string) => {
    if (!user) return;
    handleAddItem({
      name,
      quantity: 1,
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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} accessibilityLabel="Ładowanie listy" />
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
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Wróć do list"
        >
          <Text style={styles.backText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">{list.title}</Text>
        <Text
          style={styles.count}
          accessibilityLabel={`${list.items.filter((i) => i.isCompleted).length} z ${list.items.length} produktów kupione`}
        >
          {list.items.filter((i) => i.isCompleted).length}/{list.items.length}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <AIInputBar onParse={parse} onAddManual={onAddManual} isParsing={isParsing} clearTrigger={inputClearTrigger} />

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

        {list.items.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Lista jest pusta.</Text>
            <Text style={styles.emptyHint}>Użyj + aby dodać produkt lub AI dla wielu.</Text>
          </View>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.sm }]}>
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.primary,
  },
  backBtn: {
    minWidth: TOUCH.minTarget,
    minHeight: TOUCH.minTarget,
    borderWidth: BORDERS.width,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: FONT_SIZE.h3,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.white,
  },
  count: {
    fontSize: FONT_SIZE.caption,
    color: COLORS.disabled,
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.sm,
  },
});
