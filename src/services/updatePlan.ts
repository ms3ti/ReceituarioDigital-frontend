import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const updatePlan = async (id: number): Promise<void> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    return await baseUrl.put(
        `/doctor/${id}/plan`,
        {},
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
};
