import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  subscribeToUserLists,
  subscribeToArchivedLists,
  createList,
  deleteList,
  archiveList,
  restoreList,
} from '../../../services/firebase/shoppingLists';
import { useAuth } from '../../auth/hooks';
import type { ShoppingList } from '../../../types/shoppingList';

interface UseShoppingListsReturn {
  lists: ShoppingList[];
  archivedLists: ShoppingList[];
  isLoading: boolean;
  error: string | null;
  handleCreate: (title: string) => Promise<string | null>;
  handleDelete: (listId: string) => Promise<void>;
  handleArchive: (listId: string) => Promise<void>;
  handleRestore: (listId: string) => Promise<void>;
  handleReorder: (orderedIds: string[]) => Promise<void>;
}

export function useShoppingLists(): UseShoppingListsReturn {
  const { user, handleUpdateListOrder } = useAuth();
  const [rawLists, setRawLists] = useState<ShoppingList[]>([]);
  const [archivedLists, setArchivedLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Subscribe only when user ID changes (login/logout), not on every user update.
  // This prevents re-subscription — and flickering — when listOrder is saved.
  useEffect(() => {
    mountedRef.current = true;
    if (!user) {
      setRawLists([]);
      setArchivedLists([]);
      setIsLoading(false);
      return;
    }

    let activeReceived = false;
    let archivedReceived = false;

    const unsubActive = subscribeToUserLists(user.id, (data) => {
      if (!mountedRef.current) return;
      setRawLists(data);
      activeReceived = true;
      if (archivedReceived) setIsLoading(false);
    });

    const unsubArchived = subscribeToArchivedLists(user.id, (data) => {
      if (!mountedRef.current) return;
      setArchivedLists(data);
      archivedReceived = true;
      if (activeReceived) setIsLoading(false);
    });

    return () => {
      mountedRef.current = false;
      unsubActive();
      unsubArchived();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Apply listOrder synchronously via useMemo — no state update, no flicker.
  const lists = useMemo(() => {
    const order = user?.listOrder;
    if (!order || order.length === 0) return rawLists;
    const indexed = new Map(rawLists.map((l) => [l.id, l]));
    const sorted = order.flatMap((id) => (indexed.has(id) ? [indexed.get(id)!] : []));
    const rest = rawLists.filter((l) => !order.includes(l.id));
    return [...sorted, ...rest];
  }, [rawLists, user?.listOrder]);

  const handleCreate = useCallback(
    async (title: string): Promise<string | null> => {
      if (!user) return null;
      setError(null);
      try {
        return await createList(title, user.id);
      } catch (err) {
        if (!mountedRef.current) return null;
        setError(err instanceof Error ? err.message : 'Nie udało się utworzyć listy.');
        return null;
      }
    },
    [user],
  );

  const handleDelete = useCallback(
    async (listId: string) => {
      if (!user) return;
      setError(null);
      try {
        await deleteList(listId, user.id);
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Nie udało się usunąć listy.');
      }
    },
    [user],
  );

  const handleArchive = useCallback(async (listId: string) => {
    setError(null);
    try {
      await archiveList(listId);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Nie udało się zarchiwizować listy.');
    }
  }, []);

  const handleRestore = useCallback(async (listId: string) => {
    setError(null);
    try {
      await restoreList(listId);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Nie udało się przywrócić listy.');
    }
  }, []);

  const handleReorder = useCallback(
    async (orderedIds: string[]) => {
      // handleUpdateListOrder updates user.listOrder optimistically before saving,
      // so useMemo re-sorts immediately without any intermediate flicker.
      await handleUpdateListOrder(orderedIds);
    },
    [handleUpdateListOrder],
  );

  return {
    lists,
    archivedLists,
    isLoading,
    error,
    handleCreate,
    handleDelete,
    handleArchive,
    handleRestore,
    handleReorder,
  };
}
