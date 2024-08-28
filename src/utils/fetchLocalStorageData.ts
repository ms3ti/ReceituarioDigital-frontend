export const asyncLocalStorage = {
    setItem: async function (key: string, value: string) {
        return await Promise.resolve().then(function () {
            localStorage.setItem(key, value);
        });
    },
    getItem: async function (key: string) {
        return await Promise.resolve().then(function () {
            return localStorage.getItem(key);
        });
    },
    removeItem: async function (key: string) {
        return await new Promise((resolve) => {
            localStorage.removeItem(key);
            resolve(null);
        });
    },
    clearAll: async function () {
        return await new Promise((resolve) => {
            localStorage.clear();
            resolve(null);
        });
    },
};
