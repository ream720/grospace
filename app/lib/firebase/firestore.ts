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
  Timestamp,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';

export interface FirestoreDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createDocument = async <T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const getDocument = async <T extends FirestoreDocument>(
  collectionName: string,
  id: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as T;
  }
  
  return null;
};

export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  id: string,
  updates: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const deleteDocument = async (
  collectionName: string,
  id: string
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

export const queryDocuments = async <T extends FirestoreDocument>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as T[];
};

export const subscribeToCollection = <T extends FirestoreDocument>(
  collectionName: string,
  callback: (documents: T[]) => void,
  constraints: QueryConstraint[] = []
): (() => void) => {
  const q = query(collection(db, collectionName), ...constraints);
  
  return onSnapshot(q, (querySnapshot) => {
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as T[];
    
    callback(documents);
  });
};

// Helper functions for common query patterns
export const whereEqual = (field: string, value: any) => where(field, '==', value);
export const orderByField = (field: string, direction: 'asc' | 'desc' = 'asc') => 
  orderBy(field, direction);