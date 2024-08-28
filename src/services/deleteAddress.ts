import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const deleteAddress = async (ownerAddressId: number): Promise<void> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    await baseUrl.delete(`/address/${ownerAddressId}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
