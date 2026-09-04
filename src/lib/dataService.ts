import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

function cleanUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      cleaned[key] = cleanUndefined(obj[key]);
    }
  }
  return cleaned;
}

export const dataService = {
  // Generic save document
  async saveDoc(collectionName: string, docId: string, data: any) {
    if (!db) {
      localStorage.setItem(collectionName + '_' + docId, JSON.stringify(data));
      return;
    }
    try {
      const sanitized = cleanUndefined(data);
      await setDoc(doc(db, collectionName, docId), {
        ...sanitized,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error(`Error saving to ${collectionName}:`, error);
      localStorage.setItem(collectionName + '_' + docId, JSON.stringify(data));
    }
  },

  // Generic get document
  async getDoc(collectionName: string, docId: string) {
    if (!db) {
      const saved = localStorage.getItem(collectionName + '_' + docId);
      return saved ? JSON.parse(saved) : null;
    }
    try {
      const docSnap = await getDoc(doc(db, collectionName, docId));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error(`Error getting from ${collectionName}:`, error);
      const saved = localStorage.getItem(collectionName + '_' + docId);
      return saved ? JSON.parse(saved) : null;
    }
  },

  // Generic listen to document
  subscribeDoc(collectionName: string, docId: string, callback: (data: any) => void) {
    if (!db) return () => {};
    return onSnapshot(doc(db, collectionName, docId), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  },

  // Generic listen to collection
  subscribeCollection(collectionName: string, constraints: any[], callback: (data: any[]) => void) {
    if (!db) return () => {};
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (querySnapshot) => {
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      callback(items);
    });
  },

  // Add item to collection
  async addDoc(collectionName: string, data: any) {
    if (!db) {
      // Local fallback for collections is harder, just console for now
      console.warn('DB not available for adding doc to ' + collectionName);
      return null;
    }
    try {
      const sanitized = cleanUndefined(data);
      const docRef = await addDoc(collection(db, collectionName), {
        ...sanitized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding to ${collectionName}:`, error);
      return null;
    }
  },

  // Delete document
  async deleteDoc(collectionName: string, docId: string) {
    if (!db) return;
    try {
      const { deleteDoc: firestoreDeleteDoc } = await import('firebase/firestore');
      await firestoreDeleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
    }
  }
};
