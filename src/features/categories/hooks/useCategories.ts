import { useCallback } from 'react';
import { CATEGORIES } from '../../../constants';
import { useAuth } from '../../auth/hooks/useAuth';
import type { CustomCategory } from '../../../types/user';

export interface UseCategoriesReturn {
  allCategories: string[];
  customCategories: CustomCategory[];
  isPremium: boolean;
  addCategory: (name: string, color: string) => Promise<void>;
  updateCategory: (oldName: string, newName: string, color: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const { user, handleUpdateCustomCategories } = useAuth();
  const customCategories: CustomCategory[] = user?.customCategories ?? [];
  const isPremium = user?.isPremium ?? false;

  const allCategories = [
    ...CATEGORIES,
    ...customCategories.map((c) => c.name),
  ];

  const addCategory = useCallback(async (name: string, color: string) => {
    await handleUpdateCustomCategories([...customCategories, { name, color }]);
  }, [customCategories, handleUpdateCustomCategories]);

  const updateCategory = useCallback(async (oldName: string, newName: string, color: string) => {
    const updated = customCategories.map((c) =>
      c.name === oldName ? { name: newName, color } : c,
    );
    await handleUpdateCustomCategories(updated);
  }, [customCategories, handleUpdateCustomCategories]);

  const deleteCategory = useCallback(async (name: string) => {
    await handleUpdateCustomCategories(customCategories.filter((c) => c.name !== name));
  }, [customCategories, handleUpdateCustomCategories]);

  return { allCategories, customCategories, isPremium, addCategory, updateCategory, deleteCategory };
}
