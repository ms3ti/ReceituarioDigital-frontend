import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const deletePatient = async (patientId: number): Promise<void> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    await baseUrl.delete(`/patient/${patientId}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
