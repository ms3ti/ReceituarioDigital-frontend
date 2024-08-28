import { IPrescriptionModel } from "../interfaces/prescriptionModel/prescriptionCompositionModel.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPrescriptionModel;
}

export const getPrescriptionModelById = async (
    prescriptionId: number,
): Promise<IPrescriptionModel> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(
        `/prescriptionModel/${prescriptionId}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
