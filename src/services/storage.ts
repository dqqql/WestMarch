interface User {
  id: string;
  username: string;
  isDM: boolean;
  nickname?: string | null;
  avatar?: string | null;
}

const STORAGE_KEYS = {
  USER: 'westmarch_user',
  SEARCH_HISTORY: 'wm-search-history',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export const storage = {
  get: <T>(key: StorageKey): T | null => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set: (key: StorageKey, value: any): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove: (key: StorageKey): void => {
    localStorage.removeItem(key);
  },

  getUser: () => storage.get<User>(STORAGE_KEYS.USER),
  setUser: (user: User) => storage.set(STORAGE_KEYS.USER, user),
  removeUser: () => storage.remove(STORAGE_KEYS.USER),

  getSearchHistory: () => storage.get<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || [],
  setSearchHistory: (history: string[]) => storage.set(STORAGE_KEYS.SEARCH_HISTORY, history),
};
