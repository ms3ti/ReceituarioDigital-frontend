import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const deletePrescriptionModel = async (
    prescriptionId: number,
): Promise<void> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    await baseUrl.delete(`prescriptionModel/${prescriptionId}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
