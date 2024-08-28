import { IPrescriptionModel } from "../interfaces/prescriptionModel/prescriptionCompositionModel.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPrescriptionModel[];
}

export const listPrescriptionModel = async (
    doctorId: number,
    documentId: number,
    title: string,
): Promise<IPrescriptionModel[]> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(
        `prescriptionModel/doctor/${doctorId}?prescriptionTitle=${title}&documentTypeId=${documentId}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
