export const readFromLocalStorageWithExpiracy = (key, defaultValue) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return defaultValue;

    const item = JSON.parse(itemStr);
    const now = Date.now();
    if (now > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const writeToLocalStorageWithExpiracy = (key, value, ttl) => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const now = Date.now();
    const item = {
      value,
      expiry: now + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};
