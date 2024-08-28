import { IUpdatePrescriptionDto } from "../interfaces/prescription/update.prescrition.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: { whatsLink: string };
}

export const updatePrescription = async (
    data: IUpdatePrescriptionDto,
): Promise<{ whatsLink: string }> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const response = await baseUrl.put<Response>(`/prescription`, data, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return response?.data?.data;
};
