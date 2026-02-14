import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  subscribeToList,
  updateListTitle,
  addItem,
  addItems,
  updateItem,
  removeItem,
  toggleItem,
} from '../../../services/firebase/shoppingLists';
import type { ShoppingList, ShoppingItem } from '../../../types/shoppingList';

interface UseShoppingListReturn {
  list: ShoppingList | null;
  isLoading: boolean;
  error: string | null;
  itemsByCategory: Record<string, ShoppingItem[]>;
  handleUpdateTitle: (title: string) => Promise<void>;
  handleAddItem: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => Promise<void>;
  handleAddItems: (items: Omit<ShoppingItem, 'id' | 'createdAt'>[]) => Promise<void>;
  handleUpdateItem: (
    itemId: string,
    updates: Partial<Pick<ShoppingItem, 'name' | 'quantity' | 'unit' | 'category'>>,
  ) => Promise<void>;
  handleToggleItem: (itemId: string) => Promise<void>;
  handleRemoveItem: (itemId: string) => Promise<void>;
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

  const itemsByCategory = useMemo(() => {
    if (!list) return {};

    const uncompleted = list.items.filter((i) => !i.isCompleted);
    const completed = list.items.filter((i) => i.isCompleted);

    const groups: Record<string, ShoppingItem[]> = {};

    for (const item of uncompleted) {
      const cat = item.category || 'Inne';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }

    if (completed.length > 0) {
      groups['Kupione'] = completed;
    }

    return groups;
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

  return {
    list,
    isLoading,
    error,
    itemsByCategory,
    handleUpdateTitle,
    handleAddItem,
    handleAddItems,
    handleUpdateItem,
    handleToggleItem,
    handleRemoveItem,
  };
}
