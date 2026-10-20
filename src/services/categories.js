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
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "categories";

/**
 * Add a new category document to Firestore.
 * Initializes with empty incomeTypes and expenseTypes arrays.
 */
export const addCategory = async (name) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    incomeTypes: [],
    expenseTypes: [],
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

/**
 * Add a new category document with specific income and expense types.
 */
export const addCategoryWithTypes = async ({ name, incomeTypes, expenseTypes }) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    incomeTypes,
    expenseTypes,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

/**
 * Update an existing category name only.
 */
export const updateCategory = async (id, newName) => {
  const categoryRef = doc(db, COLLECTION, id);
  await updateDoc(categoryRef, {
    name: newName,
    updatedAt: Timestamp.now(),
  });
};

/**
 * Update all fields of a category: name, incomeTypes, expenseTypes.
 */
export const updateCategoryTypes = async (id, { name, incomeTypes, expenseTypes }) => {
  const categoryRef = doc(db, COLLECTION, id);
  await updateDoc(categoryRef, {
    name,
    incomeTypes,
    expenseTypes,
    updatedAt: Timestamp.now(),
  });
};

/**
 * Delete a category.
 */
export const deleteCategory = async (id) => {
  const categoryRef = doc(db, COLLECTION, id);
  await deleteDoc(categoryRef);
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
