import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from '../../constants';
import type { Invite } from '../../types/shoppingList';

// Exclude ambiguous characters: I/1, O/0
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

const inviteDoc = (code: string) => doc(db, COLLECTIONS.INVITES, code);
const listDoc = (id: string) => doc(db, COLLECTIONS.SHOPPING_LISTS, id);
const userDoc = (id: string) => doc(db, COLLECTIONS.USERS, id);

// ─── Create Invite ───────────────────────────────────────

export async function createInvite(
  listId: string,
  listTitle: string,
  ownerName: string,
  ownerId: string,
): Promise<string> {
  let code = '';
  let attempts = 0;

  do {
    code = generateCode();
    const existing = await getDoc(inviteDoc(code));
    if (!existing.exists()) break;
    attempts++;
  } while (attempts < 5);

  if (attempts >= 5) {
    throw new Error('Nie udało się wygenerować kodu. Spróbuj ponownie.');
  }

  await setDoc(inviteDoc(code), {
    listId,
    listTitle,
    ownerName,
    ownerId,
    createdAt: serverTimestamp(),
  });

  // Store code on list doc for quick access by owner
  await updateDoc(listDoc(listId), {
    inviteCode: code,
    updatedAt: serverTimestamp(),
  });

  return code;
}

// ─── Look Up Invite ──────────────────────────────────────

export async function lookupInvite(code: string): Promise<Invite | null> {
  const upperCode = code.toUpperCase().trim();
  if (upperCode.length !== CODE_LENGTH) return null;

  const snapshot = await getDoc(inviteDoc(upperCode));
  if (!snapshot.exists()) return null;

  return { code: snapshot.id, ...snapshot.data() } as Invite;
}

// ─── Join List via Invite ────────────────────────────────

export async function joinList(listId: string, userId: string): Promise<void> {
  // Self-join: guarded by isSelfJoinOnly() Firestore rule
  await updateDoc(listDoc(listId), {
    memberIds: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });

  // Update own user doc (allowed by user rules)
  await updateDoc(userDoc(userId), {
    sharedListIds: arrayUnion(listId),
  });
}

// ─── Delete Invite ───────────────────────────────────────

export async function deleteInvite(code: string, listId: string): Promise<void> {
  await deleteDoc(inviteDoc(code));

  await updateDoc(listDoc(listId), {
    inviteCode: null,
    updatedAt: serverTimestamp(),
  });
}
