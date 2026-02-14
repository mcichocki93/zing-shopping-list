import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
  type WithFieldValue,
} from 'firebase/firestore';
import { db } from './config';

export { serverTimestamp };

export function getCollectionRef(path: string) {
  return collection(db, path);
}

export function getDocRef(path: string, id: string) {
  return doc(db, path, id);
}

export async function addDocument<T extends DocumentData>(
  path: string,
  data: WithFieldValue<T>,
): Promise<string> {
  const ref = await addDoc(collection(db, path), data);
  return ref.id;
}

export async function getDocument<T>(
  path: string,
  id: string,
): Promise<(T & { id: string }) | null> {
  const snapshot = await getDoc(doc(db, path, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
}

export async function queryDocuments<T>(
  path: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  const q = query(collection(db, path), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T & { id: string });
}

export async function updateDocument<T extends DocumentData>(
  path: string,
  id: string,
  data: Partial<T>,
): Promise<void> {
  await updateDoc(doc(db, path, id), data);
}

export async function deleteDocument(
  path: string,
  id: string,
): Promise<void> {
  await deleteDoc(doc(db, path, id));
}

export function subscribeToCollection<T>(
  path: string,
  constraints: QueryConstraint[],
  callback: (docs: (T & { id: string })[]) => void,
): Unsubscribe {
  const q = query(collection(db, path), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T & { id: string });
    callback(docs);
  });
}

export function subscribeToDocument<T>(
  path: string,
  id: string,
  callback: (doc: (T & { id: string }) | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, path, id), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ id: snapshot.id, ...snapshot.data() } as T & { id: string });
  });
}

export { where, orderBy };
