import { IPrescriptionModel } from "../interfaces/prescriptionModel/prescriptionCompositionModel.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const updatePrescriptionModel = async (
    data: IPrescriptionModel,
): Promise<void> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    await baseUrl.put(`/prescriptionModel`, data, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
