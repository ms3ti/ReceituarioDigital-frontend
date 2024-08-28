import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";
export const approveDoctor = async (
    id: number,
    action: string,
): Promise<any> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get(`/auth/approve/${id}/${action}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return [result.data.data];
};
