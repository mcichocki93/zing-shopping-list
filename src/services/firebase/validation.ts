import type { ShoppingList, ShoppingItem } from '../../types/shoppingList';

export function validateShoppingItem(item: Partial<ShoppingItem>): item is ShoppingItem {
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    item.name.trim().length > 0 &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    typeof item.isCompleted === 'boolean' &&
    typeof item.createdBy === 'string'
  );
}

export function validateShoppingList(
  list: Partial<Omit<ShoppingList, 'id'>>,
): boolean {
  return (
    typeof list.title === 'string' &&
    list.title.trim().length > 0 &&
    typeof list.ownerId === 'string' &&
    Array.isArray(list.memberIds) &&
    typeof list.isArchived === 'boolean' &&
    Array.isArray(list.items) &&
    list.items.every(validateShoppingItem)
  );
}

export function sanitizeString(input: string, maxLength = 200): string {
  return input.trim().slice(0, maxLength);
}
