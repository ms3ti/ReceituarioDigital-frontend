import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const saveImage = async (
    ownerAddressId: number,
    doctorId: number,
    image: any,
) => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    await baseUrl.post(
        `/prescription/saveImage?doctorId=${doctorId}&ownerAddressId=${ownerAddressId}`,
        image,
        {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
};
