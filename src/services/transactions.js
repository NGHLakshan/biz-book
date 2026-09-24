import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "transactions";

/**
 * Add a new transaction document to Firestore.
 * Works offline — queued in IndexedDB and auto-synced when online.
 */
export const addTransaction = async (data) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    date: Timestamp.fromDate(new Date(data.date)),
    time: data.time || "",
    type: data.type,
    category: data.category,
    subCategory: data.subCategory,
    amount: Number(data.amount),
    paymentMethod: data.paymentMethod,
    description: data.description || "",
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

/**
 * Update an existing transaction document in Firestore.
 */
export const updateTransaction = async (id, data) => {
  const docRef = doc(db, COLLECTION, id);
  const updatePayload = {
    type: data.type,
    category: data.category,
    subCategory: data.subCategory,
    amount: Number(data.amount),
    paymentMethod: data.paymentMethod,
    description: data.description || "",
    time: data.time || "",
    updatedAt: Timestamp.now(),
  };

  if (data.date) {
    updatePayload.date = data.date instanceof Date 
      ? Timestamp.fromDate(data.date) 
      : Timestamp.fromDate(new Date(data.date));
  }

  await updateDoc(docRef, updatePayload);
};

/**
 * Delete a transaction document from Firestore.
 */
export const deleteTransaction = async (id) => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Subscribe to all transactions, ordered by date descending.
 * Returns an unsubscribe function to clean up the listener.
 * Reads from local IndexedDB cache when offline.
 */
export const subscribeToTransactions = (callback) => {
  const q = query(
    collection(db, COLLECTION),
    orderBy("date", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp → JS Date
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
        amount: Number(data.amount),
      };
    });
    callback(transactions);
  });
};

