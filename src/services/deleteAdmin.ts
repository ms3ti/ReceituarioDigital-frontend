import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const deleteAdmin = async (personId: number): Promise<void> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    await baseUrl.delete(`/person/admin/${personId}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
