import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const getUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in");
    return user.uid;
};

// Categories
export async function loadCategories() {
    try {
        const q = query(collection(db, "categories"), where("userId", "==", getUserId()));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return results.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error loading categories:", error);
        return [];
    }
}

export async function saveCategory(categoryName) {
    try {
        const docRef = await addDoc(collection(db, "categories"), {
            name: categoryName,
            userId: getUserId(),
            createdAt: serverTimestamp(),
        });
        return { id: docRef.id, name: categoryName };
    } catch (error) {
        console.error("Error saving category:", error);
        throw error;
    }
}

export async function deleteCategory(categoryId) {
    try {
        await deleteDoc(doc(db, "categories", categoryId));
        return true;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
}

// Products
export async function loadProducts() {
    try {
        const q = query(collection(db, "products"), where("userId", "==", getUserId()));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by lastUpdated desc in memory
        return results.sort((a, b) => {
            const timeA = a.lastUpdated?.toMillis?.() || 0;
            const timeB = b.lastUpdated?.toMillis?.() || 0;
            return timeB - timeA;
        });
    } catch (error) {
        console.error("Error loading products:", error);
        return [];
    }
}

export async function saveProduct(product) {
    try {
        if (product.id) {
            const productRef = doc(db, "products", product.id);
            const updateData = { ...product };
            delete updateData.id;

            await updateDoc(productRef, {
                ...updateData,
                lastUpdated: serverTimestamp(),
            });
            return product;
        } else {
            const docRef = await addDoc(collection(db, "products"), {
                ...product,
                userId: getUserId(),
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),
            });
            return { ...product, id: docRef.id };
        }
    } catch (error) {
        console.error("Error saving product:", error);
        throw error;
    }
}

export async function deleteProduct(productId) {
    try {
        await deleteDoc(doc(db, "products", productId));
        return true;
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}

// Batch History
export async function loadBatchHistory() {
    try {
        const q = query(collection(db, "batchHistory"), where("userId", "==", getUserId()));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by date desc in memory
        results.sort((a, b) => {
            const timeA = a.date?.toMillis?.() || 0;
            const timeB = b.date?.toMillis?.() || 0;
            return timeB - timeA;
        });

        return results.slice(0, 10);
    } catch (error) {
        console.error("Error loading batch history:", error);
        return [];
    }
}

export async function saveBatchHistory(batchData) {
    try {
        const docRef = await addDoc(collection(db, "batchHistory"), {
            ...batchData,
            userId: getUserId(),
            date: serverTimestamp(),
        });
        return { id: docRef.id, ...batchData };
    } catch (error) {
        console.error("Error saving batch history:", error);
        throw error;
    }
}

export async function loadProductBatches(productId) {
    try {
        const q = query(collection(db, "batchHistory"), where("userId", "==", getUserId()));
        const snapshot = await getDocs(q);

        const productBatches = [];
        snapshot.forEach((d) => {
            const data = d.data();
            if (data.batches) {
                const batch = data.batches.find((b) => b.productId === productId);
                if (batch) {
                    productBatches.push({
                        id: d.id,
                        date: data.date,
                        ...batch,
                    });
                }
            }
        });

        productBatches.sort((a, b) => {
            const timeA = a.date?.toMillis?.() || 0;
            const timeB = b.date?.toMillis?.() || 0;
            return timeB - timeA;
        });

        return productBatches;
    } catch (error) {
        console.error("Error loading product batches:", error);
        return [];
    }
}

// PDF Settings
export async function loadPdfSettings() {
    try {
        const docRef = doc(db, "settings", getUserId());
        const d = await getDoc(docRef);
        if (d.exists()) {
            return d.data();
        }
        return null;
    } catch (error) {
        console.error("Error loading PDF settings:", error);
        return null;
    }
}

export async function savePdfSettings(settings) {
    try {
        await setDoc(doc(db, "settings", getUserId()), settings);
        return true;
    } catch (error) {
        console.error("Error saving PDF settings:", error);
        throw error;
    }
}
