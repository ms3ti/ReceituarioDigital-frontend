import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const blockUser = async (id: number) => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    await baseUrl.patch(`/person/${id}/enable`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
