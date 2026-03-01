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
  type FirestoreError,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { FirestoreDocument } from '../firebase/firestore';
import { cleanFirestoreData } from '../utils/firestoreUtils';

export interface ServiceError {
  code: string;
  message: string;
  details?: any;
}

export interface ServiceResult<T> {
  data?: T;
  error?: ServiceError;
  loading?: boolean;
}

export interface QueryFilters {
  where?: Array<{ field: string; operator: any; value: any }>;
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
}

export abstract class BaseService<T extends FirestoreDocument> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Recursively convert Firestore timestamp-like values into Date objects.
   */
  private convertFirestoreDates(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (value instanceof Date) {
      return value;
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as { toDate?: unknown }).toDate === 'function'
    ) {
      try {
        return (value as { toDate: () => Date }).toDate();
      } catch {
        return value;
      }
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.convertFirestoreDates(item));
    }

    if (typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
          key,
          this.convertFirestoreDates(nestedValue),
        ])
      );
    }

    return value;
  }

  private mapDocument(id: string, data: DocumentData): T {
    return {
      ...(this.convertFirestoreDates(data) as Record<string, unknown>),
      id,
    } as T;
  }

  /**
   * Create a new document in the collection
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResult<T>> {
    try {
      const now = Timestamp.now();
      const cleanData = cleanFirestoreData({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      
      const docRef = await addDoc(collection(db, this.collectionName), cleanData);

      const createdDoc = await this.getById(docRef.id);
      return { data: createdDoc.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  /**
   * Get a document by ID
   */
  async getById(id: string): Promise<ServiceResult<T>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const document = this.mapDocument(docSnap.id, docSnap.data());
        return { data: document };
      }
      
      return { error: { code: 'NOT_FOUND', message: 'Document not found' } };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  /**
   * Update a document by ID
   */
  async update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ServiceResult<T>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const cleanUpdates = cleanFirestoreData({
        ...updates,
        updatedAt: Timestamp.now(),
      });
      
      await updateDoc(docRef, cleanUpdates);

      const updatedDoc = await this.getById(id);
      return { data: updatedDoc.data };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  /**
   * Delete a document by ID
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return { data: undefined };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  /**
   * List documents with optional filters
   */
  async list(filters?: QueryFilters): Promise<ServiceResult<T[]>> {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (filters?.where) {
        filters.where.forEach(({ field, operator, value }) => {
          constraints.push(where(field, operator, value));
        });
      }
      
      if (filters?.orderBy) {
        filters.orderBy.forEach(({ field, direction }) => {
          constraints.push(orderBy(field, direction));
        });
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const documents = querySnapshot.docs.map((snapshotDoc) =>
        this.mapDocument(snapshotDoc.id, snapshotDoc.data())
      );

      return { data: documents };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  /**
   * Subscribe to real-time updates for a collection
   */
  subscribe(
    callback: (result: ServiceResult<T[]>) => void,
    filters?: QueryFilters
  ): () => void {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (filters?.where) {
        filters.where.forEach(({ field, operator, value }) => {
          constraints.push(where(field, operator, value));
        });
      }
      
      if (filters?.orderBy) {
        filters.orderBy.forEach(({ field, direction }) => {
          constraints.push(orderBy(field, direction));
        });
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      
      return onSnapshot(
        q,
        (querySnapshot) => {
          const documents = querySnapshot.docs.map((snapshotDoc) =>
            this.mapDocument(snapshotDoc.id, snapshotDoc.data())
          );
          
          callback({ data: documents });
        },
        (error) => {
          callback({ error: this.handleError(error) });
        }
      );
    } catch (error) {
      callback({ error: this.handleError(error) });
      return () => {}; // Return empty unsubscribe function
    }
  }

  /**
   * Subscribe to real-time updates for a single document
   */
  subscribeToDocument(
    id: string,
    callback: (result: ServiceResult<T>) => void
  ): () => void {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      return onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const document = this.mapDocument(docSnap.id, docSnap.data());
            callback({ data: document });
          } else {
            callback({ error: { code: 'NOT_FOUND', message: 'Document not found' } });
          }
        },
        (error) => {
          callback({ error: this.handleError(error) });
        }
      );
    } catch (error) {
      callback({ error: this.handleError(error) });
      return () => {}; // Return empty unsubscribe function
    }
  }

  /**
   * Handle Firebase errors and convert them to ServiceError format
   */
  protected handleError(error: any): ServiceError {
    if (error.code) {
      // Firebase error
      const firebaseError = error as FirestoreError;
      switch (firebaseError.code) {
        case 'permission-denied':
          return {
            code: 'PERMISSION_DENIED',
            message: 'You do not have permission to perform this action',
            details: firebaseError,
          };
        case 'not-found':
          return {
            code: 'NOT_FOUND',
            message: 'The requested document was not found',
            details: firebaseError,
          };
        case 'already-exists':
          return {
            code: 'ALREADY_EXISTS',
            message: 'A document with this ID already exists',
            details: firebaseError,
          };
        case 'failed-precondition':
          return {
            code: 'FAILED_PRECONDITION',
            message: 'The operation failed due to a precondition failure. This might be due to missing Firestore indexes or security rules.',
            details: firebaseError,
          };
        case 'aborted':
          return {
            code: 'ABORTED',
            message: 'The operation was aborted due to a conflict',
            details: firebaseError,
          };
        case 'out-of-range':
          return {
            code: 'OUT_OF_RANGE',
            message: 'The specified range is invalid',
            details: firebaseError,
          };
        case 'unimplemented':
          return {
            code: 'UNIMPLEMENTED',
            message: 'This operation is not implemented',
            details: firebaseError,
          };
        case 'internal':
          return {
            code: 'INTERNAL_ERROR',
            message: 'An internal error occurred',
            details: firebaseError,
          };
        case 'unavailable':
          return {
            code: 'UNAVAILABLE',
            message: 'The service is currently unavailable',
            details: firebaseError,
          };
        case 'data-loss':
          return {
            code: 'DATA_LOSS',
            message: 'Unrecoverable data loss or corruption',
            details: firebaseError,
          };
        case 'unauthenticated':
          return {
            code: 'UNAUTHENTICATED',
            message: 'You must be authenticated to perform this action',
            details: firebaseError,
          };
        default:
          return {
            code: 'UNKNOWN_FIREBASE_ERROR',
            message: firebaseError.message || 'An unknown Firebase error occurred',
            details: firebaseError,
          };
      }
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error,
    };
  }
}
