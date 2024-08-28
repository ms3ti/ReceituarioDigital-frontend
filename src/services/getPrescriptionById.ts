import { IPrescriptionDto } from "../interfaces/prescription/prescription.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPrescriptionDto;
}

export const getPrescriptionById = async (
    prescriptionId: number,
): Promise<IPrescriptionDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const result = await baseUrl.get<Response>(
        `/prescription/${prescriptionId}/`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
