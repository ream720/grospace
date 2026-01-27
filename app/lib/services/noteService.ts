import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db as firestore, storage } from '../firebase/config';
import type { Note, CreateNoteData, UpdateNoteData, NoteFilters } from '../types/note';

export class NoteService {
  private collectionName = 'notes';

  async create(data: CreateNoteData, userId: string): Promise<Note> {
    try {
      // Upload photos first if any
      const photoUrls: string[] = [];
      if (data.photos && data.photos.length > 0) {
        for (const photo of data.photos) {
          const photoUrl = await this.uploadPhoto(photo, userId);
          photoUrls.push(photoUrl);
        }
      }

      const noteData = {
        userId,
        plantId: data.plantId || null,
        spaceId: data.spaceId || null,
        content: data.content,
        category: data.category,
        photos: photoUrls,
        timestamp: data.timestamp ? Timestamp.fromDate(data.timestamp) : Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(firestore, this.collectionName), noteData);
      
      return {
        id: docRef.id,
        ...noteData,
        timestamp: noteData.timestamp.toDate(),
        createdAt: noteData.createdAt.toDate(),
        updatedAt: noteData.updatedAt.toDate(),
      } as Note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
  }

  async getById(id: string): Promise<Note | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        timestamp: data.timestamp.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Note;
    } catch (error) {
      console.error('Error getting note:', error);
      throw new Error('Failed to get note');
    }
  }

  async update(id: string, updates: UpdateNoteData): Promise<Note> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      if (updates.timestamp) {
        updateData.timestamp = Timestamp.fromDate(updates.timestamp);
      }

      await updateDoc(docRef, updateData);
      
      const updatedNote = await this.getById(id);
      if (!updatedNote) {
        throw new Error('Note not found after update');
      }
      
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Failed to update note');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Get the note first to delete associated photos
      const note = await this.getById(id);
      if (note && note.photos.length > 0) {
        // Delete photos from storage
        for (const photoUrl of note.photos) {
          try {
            const photoRef = ref(storage, photoUrl);
            await deleteObject(photoRef);
          } catch (photoError) {
            console.warn('Error deleting photo:', photoError);
            // Continue with note deletion even if photo deletion fails
          }
        }
      }

      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  }

  async list(userId: string, filters?: NoteFilters): Promise<Note[]> {
    try {
      // Simple query without orderBy to avoid index requirement
      // We'll sort client-side for now
      let q = query(
        collection(firestore, this.collectionName),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      
      let notes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Note;
      });

      // Sort by timestamp descending (client-side)
      notes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Apply client-side filters
      if (filters?.plantId) {
        notes = notes.filter(note => note.plantId === filters.plantId);
      }

      if (filters?.spaceId) {
        notes = notes.filter(note => note.spaceId === filters.spaceId);
      }

      if (filters?.category) {
        notes = notes.filter(note => note.category === filters.category);
      }

      if (filters?.startDate) {
        notes = notes.filter(note => note.timestamp >= filters.startDate!);
      }

      if (filters?.endDate) {
        notes = notes.filter(note => note.timestamp <= filters.endDate!);
      }

      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        notes = notes.filter(note => 
          note.content.toLowerCase().includes(searchTerm)
        );
      }

      // Apply limit if specified
      if (filters?.limit) {
        notes = notes.slice(0, filters.limit);
      }

      return notes;
    } catch (error) {
      console.error('Error listing notes:', error);
      throw new Error('Failed to list notes');
    }
  }

  subscribe(
    userId: string, 
    callback: (notes: Note[]) => void, 
    filters?: NoteFilters
  ): () => void {
    try {
      const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      ];

      if (filters?.plantId) {
        constraints.splice(1, 0, where('plantId', '==', filters.plantId));
      }

      if (filters?.spaceId) {
        constraints.splice(1, 0, where('spaceId', '==', filters.spaceId));
      }

      if (filters?.category) {
        constraints.splice(1, 0, where('category', '==', filters.category));
      }

      const q = query(collection(firestore, this.collectionName), ...constraints);
      
      return onSnapshot(q, (querySnapshot) => {
        let notes = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          } as Note;
        });

        // Apply client-side filters
        if (filters?.startDate) {
          notes = notes.filter(note => note.timestamp >= filters.startDate!);
        }

        if (filters?.endDate) {
          notes = notes.filter(note => note.timestamp <= filters.endDate!);
        }

        if (filters?.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase();
          notes = notes.filter(note => 
            note.content.toLowerCase().includes(searchTerm)
          );
        }

        callback(notes);
      }, (error) => {
        console.error('Error in notes subscription:', error);
      });
    } catch (error) {
      console.error('Error setting up notes subscription:', error);
      return () => {};
    }
  }

  private async uploadPhoto(file: File, userId: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const photoRef = ref(storage, `notes/${userId}/${fileName}`);
      
      const snapshot = await uploadBytes(photoRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo');
    }
  }
}

export const noteService = new NoteService();