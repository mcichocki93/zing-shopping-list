import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from '../../constants';
import { sanitizeString } from './validation';
import type { ListTemplate, TemplateItem } from '../../types/template';

function templatesRef(userId: string) {
  return collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TEMPLATES);
}

export async function saveTemplate(
  userId: string,
  name: string,
  items: TemplateItem[],
): Promise<string> {
  const sanitizedName = sanitizeString(name, 100);
  const cleanItems = items.map((item) => {
    const base: Record<string, unknown> = {
      name: item.name,
      quantity: item.quantity,
    };
    if (item.unit !== undefined) base.unit = item.unit;
    if (item.category !== undefined) base.category = item.category;
    return base;
  });

  const ref = await addDoc(templatesRef(userId), {
    name: sanitizedName,
    items: cleanItems,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getTemplates(userId: string): Promise<ListTemplate[]> {
  const q = query(templatesRef(userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<ListTemplate, 'id'>),
  }));
}

export async function deleteTemplate(userId: string, templateId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.TEMPLATES, templateId));
}
