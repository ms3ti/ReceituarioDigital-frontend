import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const removeImage = async (ownerAddressId: number) => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    await baseUrl.delete(
        `/prescription/removeImage?ownerAddressId=${ownerAddressId}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
};
