import { useState, useEffect, useCallback, useRef } from 'react';
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
  handleDelete: (listId: string, memberIds: string[]) => Promise<void>;
  handleArchive: (listId: string) => Promise<void>;
  handleRestore: (listId: string) => Promise<void>;
}

export function useShoppingLists(): UseShoppingListsReturn {
  const { user } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [archivedLists, setArchivedLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!user) {
      setLists([]);
      setArchivedLists([]);
      setIsLoading(false);
      return;
    }

    let activeReceived = false;
    let archivedReceived = false;

    const unsubActive = subscribeToUserLists(user.id, (data) => {
      if (!mountedRef.current) return;
      setLists(data);
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
  }, [user]);

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
    async (listId: string, memberIds: string[]) => {
      setError(null);
      try {
        await deleteList(listId, memberIds);
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Nie udało się usunąć listy.');
      }
    },
    [],
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

  return {
    lists,
    archivedLists,
    isLoading,
    error,
    handleCreate,
    handleDelete,
    handleArchive,
    handleRestore,
  };
}
