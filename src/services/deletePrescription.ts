import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const deletePrescription = async (
    prescriptionId: number,
): Promise<void> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    await baseUrl.delete(`/prescription/${prescriptionId}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
