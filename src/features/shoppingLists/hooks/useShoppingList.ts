import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  subscribeToList,
  updateListTitle,
  addItem,
  addItems,
  updateItem,
  removeItem,
  toggleItem,
  updateCategoryOrder,
  resetAllItems,
} from '../../../services/firebase/shoppingLists';
import { CATEGORIES } from '../../../constants';
import type { ShoppingList, ShoppingItem } from '../../../types/shoppingList';

export interface CategoryGroup {
  category: string;
  items: ShoppingItem[];
}

interface UseShoppingListReturn {
  list: ShoppingList | null;
  isLoading: boolean;
  error: string | null;
  allCompleted: boolean;
  sortedCategories: CategoryGroup[];
  handleUpdateTitle: (title: string) => Promise<void>;
  handleAddItem: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => Promise<void>;
  handleAddItems: (items: Omit<ShoppingItem, 'id' | 'createdAt'>[]) => Promise<void>;
  handleUpdateItem: (
    itemId: string,
    updates: Partial<Pick<ShoppingItem, 'name' | 'quantity' | 'unit' | 'category'>>,
  ) => Promise<void>;
  handleToggleItem: (itemId: string) => Promise<void>;
  handleRemoveItem: (itemId: string) => Promise<void>;
  handleReorderCategory: (category: string, direction: 'up' | 'down') => Promise<void>;
  handleSetCategoryOrder: (newOrder: string[]) => Promise<void>;
  handleResetAll: () => Promise<void>;
}

export function useShoppingList(listId: string | null): UseShoppingListReturn {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!listId) {
      setList(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsub = subscribeToList(listId, (data) => {
      if (!mountedRef.current) return;
      setList(data);
      setIsLoading(false);
    });

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [listId]);

  const sortedCategories = useMemo((): CategoryGroup[] => {
    if (!list) return [];

    const uncompleted = list.items.filter((i) => !i.isCompleted);
    const completed = list.items.filter((i) => i.isCompleted);

    const groups: Record<string, ShoppingItem[]> = {};
    for (const item of uncompleted) {
      const cat = item.category || 'Inne';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }

    const presentCategories = Object.keys(groups);
    const order = list.categoryOrder ?? [...CATEGORIES];

    const sorted = presentCategories.sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      // Categories not in order go to the end (before "Inne")
      const aIdx = ai !== -1 ? ai : order.length;
      const bIdx = bi !== -1 ? bi : order.length;
      return aIdx - bIdx;
    });

    const result: CategoryGroup[] = sorted.map((cat) => ({ category: cat, items: groups[cat] }));

    if (completed.length > 0) {
      result.push({ category: 'Kupione', items: completed });
    }

    return result;
  }, [list]);

  const withError = useCallback(
    async (fn: () => Promise<void>, fallbackMsg: string) => {
      setError(null);
      try {
        await fn();
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : fallbackMsg);
      }
    },
    [],
  );

  const handleUpdateTitle = useCallback(
    (title: string) =>
      withError(
        () => updateListTitle(listId!, title),
        'Nie udało się zmienić nazwy.',
      ),
    [listId, withError],
  );

  const handleAddItem = useCallback(
    (item: Omit<ShoppingItem, 'id' | 'createdAt'>) =>
      withError(
        () => addItem(listId!, item),
        'Nie udało się dodać produktu.',
      ),
    [listId, withError],
  );

  const handleAddItems = useCallback(
    (items: Omit<ShoppingItem, 'id' | 'createdAt'>[]) =>
      withError(
        () => addItems(listId!, items),
        'Nie udało się dodać produktów.',
      ),
    [listId, withError],
  );

  const handleUpdateItem = useCallback(
    (itemId: string, updates: Partial<Pick<ShoppingItem, 'name' | 'quantity' | 'unit' | 'category'>>) =>
      withError(
        () => updateItem(listId!, list?.items ?? [], itemId, updates),
        'Nie udało się zaktualizować produktu.',
      ),
    [listId, list, withError],
  );

  const handleToggleItem = useCallback(
    (itemId: string) =>
      withError(
        () => toggleItem(listId!, list?.items ?? [], itemId),
        'Nie udało się zmienić statusu.',
      ),
    [listId, list, withError],
  );

  const handleRemoveItem = useCallback(
    (itemId: string) =>
      withError(
        () => removeItem(listId!, list?.items ?? [], itemId),
        'Nie udało się usunąć produktu.',
      ),
    [listId, list, withError],
  );

  const handleReorderCategory = useCallback(
    (category: string, direction: 'up' | 'down') => {
      const currentOrder = sortedCategories
        .filter((g) => g.category !== 'Kupione')
        .map((g) => g.category);
      const idx = currentOrder.indexOf(category);
      if (idx === -1) return Promise.resolve();
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= currentOrder.length) return Promise.resolve();

      const newOrder = [...currentOrder];
      [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

      return withError(
        () => updateCategoryOrder(listId!, newOrder),
        'Nie udało się zmienić kolejności.',
      );
    },
    [listId, sortedCategories, withError],
  );

  const handleSetCategoryOrder = useCallback(
    (newOrder: string[]) => {
      // Optimistic update — prevents flicker while waiting for Firestore listener
      setList((prev) => prev ? { ...prev, categoryOrder: newOrder } : prev);
      return withError(
        () => updateCategoryOrder(listId!, newOrder),
        'Nie udało się zmienić kolejności.',
      );
    },
    [listId, withError],
  );

  const allCompleted = list !== null && list.items.length > 0 && list.items.every((i) => i.isCompleted);

  const handleResetAll = useCallback(
    () =>
      withError(
        () => resetAllItems(listId!, list?.items ?? []),
        'Nie udało się zresetować listy.',
      ),
    [listId, list, withError],
  );

  return {
    list,
    isLoading,
    error,
    allCompleted,
    sortedCategories,
    handleUpdateTitle,
    handleAddItem,
    handleAddItems,
    handleUpdateItem,
    handleToggleItem,
    handleRemoveItem,
    handleReorderCategory,
    handleSetCategoryOrder,
    handleResetAll,
  };
}
