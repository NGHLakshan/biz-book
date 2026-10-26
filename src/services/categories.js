import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "categories";

/**
 * Execute a Firestore write with offline-first speed:
 * - If offline: writes to local cache (IndexedDB) immediately and resolves without waiting for Google Cloud server ack.
 * - If online: awaits server acknowledgement, but caps waiting at 800ms so network hiccups never freeze the UI.
 */
const executeWrite = async (writePromise) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    writePromise.catch((err) => console.error("Firestore offline write error:", err));
    return;
  }

  await Promise.race([
    writePromise,
    new Promise((resolve) => setTimeout(resolve, 800)),
  ]);
};

/**
 * Add a new category document to Firestore.
 * Initializes with empty incomeTypes and expenseTypes arrays.
 */
export const addCategory = async (name) => {
  const docRef = doc(collection(db, COLLECTION));
  const writePromise = setDoc(docRef, {
    name,
    incomeTypes: [],
    expenseTypes: [],
    createdAt: Timestamp.now(),
  });
  await executeWrite(writePromise);
  return docRef.id;
};

/**
 * Add a new category document with specific income and expense types.
 */
export const addCategoryWithTypes = async ({ name, incomeTypes, expenseTypes }) => {
  const docRef = doc(collection(db, COLLECTION));
  const writePromise = setDoc(docRef, {
    name,
    incomeTypes,
    expenseTypes,
    createdAt: Timestamp.now(),
  });
  await executeWrite(writePromise);
  return docRef.id;
};

/**
 * Update an existing category name only.
 */
export const updateCategory = async (id, newName) => {
  const categoryRef = doc(db, COLLECTION, id);
  const writePromise = updateDoc(categoryRef, {
    name: newName,
    updatedAt: Timestamp.now(),
  });
  await executeWrite(writePromise);
};

/**
 * Update all fields of a category: name, incomeTypes, expenseTypes.
 */
export const updateCategoryTypes = async (id, { name, incomeTypes, expenseTypes }) => {
  const categoryRef = doc(db, COLLECTION, id);
  const writePromise = updateDoc(categoryRef, {
    name,
    incomeTypes,
    expenseTypes,
    updatedAt: Timestamp.now(),
  });
  await executeWrite(writePromise);
};

/**
 * Delete a category.
 */
export const deleteCategory = async (id) => {
  const categoryRef = doc(db, COLLECTION, id);
  const writePromise = deleteDoc(categoryRef);
  await executeWrite(writePromise);
};

/**
 * Subscribe to all categories, ordered by creation date.
 */
export const subscribeToCategories = (callback) => {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        incomeTypes: [],
        expenseTypes: [],
        ...data,
      };
    });
    callback(categories);
  });
};
