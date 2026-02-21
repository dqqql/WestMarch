const DB_NAME = "WestMarchDB";
const DB_VERSION = 1;
const STORE_NAME = "resources";

interface StoredResource {
  id: string;
  name: string;
  url: string;
  category: string;
  createdAt: number;
}

let db: IDBDatabase | null = null;

export function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

export async function addResource(resource: StoredResource): Promise<void> {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(resource);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteResource(id: string): Promise<void> {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllResources(): Promise<StoredResource[]> {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getResourcesByCategory(category: string): Promise<StoredResource[]> {
  if (!db) await initDB();
  const all = await getAllResources();
  return all.filter((r) => r.category === category || r.category === "general");
}
