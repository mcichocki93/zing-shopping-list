import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from '../../constants';
import { validateShoppingList, sanitizeString } from './validation';
import type { ShoppingList, ShoppingItem } from '../../types/shoppingList';

const listsRef = () => collection(db, COLLECTIONS.SHOPPING_LISTS);
const listDoc = (id: string) => doc(db, COLLECTIONS.SHOPPING_LISTS, id);
const userDoc = (id: string) => doc(db, COLLECTIONS.USERS, id);

// ─── Create ──────────────────────────────────────────────

export async function createList(title: string, ownerId: string): Promise<string> {
  const sanitizedTitle = sanitizeString(title, 100);
  const data = {
    title: sanitizedTitle,
    ownerId,
    memberIds: [ownerId],
    isArchived: false,
    items: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(listsRef(), data);

  await updateDoc(userDoc(ownerId), {
    sharedListIds: arrayUnion(ref.id),
  });

  return ref.id;
}

// ─── Update ──────────────────────────────────────────────

export async function updateListTitle(listId: string, title: string): Promise<void> {
  const sanitizedTitle = sanitizeString(title, 100);
  if (!sanitizedTitle) return;

  await updateDoc(listDoc(listId), {
    title: sanitizedTitle,
    updatedAt: serverTimestamp(),
  });
}

export async function archiveList(listId: string): Promise<void> {
  await updateDoc(listDoc(listId), {
    isArchived: true,
    updatedAt: serverTimestamp(),
  });
}

export async function restoreList(listId: string): Promise<void> {
  await updateDoc(listDoc(listId), {
    isArchived: false,
    updatedAt: serverTimestamp(),
  });
}

// ─── Delete ──────────────────────────────────────────────

export async function deleteList(listId: string, ownerId: string): Promise<void> {
  await deleteDoc(listDoc(listId));

  // Only clean up the owner's sharedListIds — Firestore rules prevent
  // updating other users' documents from the client.
  await updateDoc(userDoc(ownerId), {
    sharedListIds: arrayRemove(listId),
  });
}

// ─── Sharing ─────────────────────────────────────────────

export async function addMember(listId: string, userId: string): Promise<void> {
  await updateDoc(listDoc(listId), {
    memberIds: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(userDoc(userId), {
    sharedListIds: arrayUnion(listId),
  });
}

export async function removeMember(listId: string, userId: string): Promise<void> {
  await updateDoc(listDoc(listId), {
    memberIds: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(userDoc(userId), {
    sharedListIds: arrayRemove(listId),
  });
}

// ─── Items ───────────────────────────────────────────────

function normalizeItemFields(item: Omit<ShoppingItem, 'id' | 'createdAt'>): Omit<ShoppingItem, 'id' | 'createdAt'> {
  const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
  const unit = typeof item.unit === 'string' && item.unit.trim() ? item.unit.trim().slice(0, 20) : undefined;
  // Firestore rejects undefined values — omit optional fields when not set
  const { unit: _u, category: _c, ...rest } = item;
  const result: Omit<ShoppingItem, 'id' | 'createdAt'> = { ...rest, quantity };
  if (unit !== undefined) result.unit = unit;
  if (item.category) result.category = item.category;
  return result;
}

export async function addItem(
  listId: string,
  item: Omit<ShoppingItem, 'id' | 'createdAt'>,
): Promise<void> {
  const normalized = normalizeItemFields(item);
  const newItem: ShoppingItem = {
    ...normalized,
    name: sanitizeString(normalized.name),
    id: doc(listsRef()).id,
    createdAt: new Date(),
  };

  await updateDoc(listDoc(listId), {
    items: arrayUnion(newItem),
    updatedAt: serverTimestamp(),
  });
}

export async function addItems(
  listId: string,
  items: Omit<ShoppingItem, 'id' | 'createdAt'>[],
): Promise<void> {
  const newItems: ShoppingItem[] = items.map((item) => {
    const normalized = normalizeItemFields(item);
    return {
      ...normalized,
      name: sanitizeString(normalized.name),
      id: doc(listsRef()).id,
      createdAt: new Date(),
    };
  });

  await updateDoc(listDoc(listId), {
    items: arrayUnion(...newItems),
    updatedAt: serverTimestamp(),
  });
}

export async function updateItem(
  listId: string,
  currentItems: ShoppingItem[],
  itemId: string,
  updates: Partial<Pick<ShoppingItem, 'name' | 'quantity' | 'unit' | 'category'>>,
): Promise<void> {
  const updatedItems = currentItems.map((item) => {
    if (item.id !== itemId) return item;
    const merged = {
      ...item,
      ...updates,
      ...(updates.name !== undefined && { name: sanitizeString(updates.name) }),
    };
    // Firestore rejects undefined values — strip them before writing
    return Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined),
    ) as unknown as ShoppingItem;
  });

  await updateDoc(listDoc(listId), {
    items: updatedItems,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleItem(
  listId: string,
  currentItems: ShoppingItem[],
  itemId: string,
): Promise<void> {
  const updatedItems = currentItems.map((item) =>
    item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item,
  );

  await updateDoc(listDoc(listId), {
    items: updatedItems,
    updatedAt: serverTimestamp(),
  });
}

export async function removeItem(
  listId: string,
  currentItems: ShoppingItem[],
  itemId: string,
): Promise<void> {
  const updatedItems = currentItems.filter((item) => item.id !== itemId);

  await updateDoc(listDoc(listId), {
    items: updatedItems,
    updatedAt: serverTimestamp(),
  });
}

export async function resetAllItems(
  listId: string,
  currentItems: ShoppingItem[],
): Promise<void> {
  const resetItems = currentItems.map((item) => ({ ...item, isCompleted: false }));

  await updateDoc(listDoc(listId), {
    items: resetItems,
    updatedAt: serverTimestamp(),
  });
}

// ─── Category Order ─────────────────────────────────────

export async function updateCategoryOrder(
  listId: string,
  categoryOrder: string[],
): Promise<void> {
  await updateDoc(listDoc(listId), {
    categoryOrder,
    updatedAt: serverTimestamp(),
  });
}

// ─── Subscriptions (real-time) ───────────────────────────

export function subscribeToUserLists(
  userId: string,
  callback: (lists: ShoppingList[]) => void,
): Unsubscribe {
  const q = query(
    listsRef(),
    where('memberIds', 'array-contains', userId),
    where('isArchived', '==', false),
  );

  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as ShoppingList,
    );
    callback(lists);
  });
}

export function subscribeToArchivedLists(
  userId: string,
  callback: (lists: ShoppingList[]) => void,
): Unsubscribe {
  const q = query(
    listsRef(),
    where('memberIds', 'array-contains', userId),
    where('isArchived', '==', true),
  );

  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as ShoppingList,
    );
    callback(lists);
  });
}

export function subscribeToList(
  listId: string,
  callback: (list: ShoppingList | null) => void,
): Unsubscribe {
  return onSnapshot(listDoc(listId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ id: snapshot.id, ...snapshot.data() } as ShoppingList);
  });
}
