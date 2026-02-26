export const indexedDBConfig = {
  dbName: process.env.NEXT_PUBLIC_INDEXEDDB_NAME || 'WestMarchDB',
  dbVersion: parseInt(process.env.NEXT_PUBLIC_INDEXEDDB_VERSION || '1'),
  storeName: 'resources',
};
