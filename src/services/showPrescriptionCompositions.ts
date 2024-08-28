import { baseUrl } from "./baseUrl";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { IShowPrescriptionComposition } from "../interfaces/prescriptionComposotion/show.prescription.composition.dto";

interface Response {
    data: IShowPrescriptionComposition;
}

export const showPrescriptionCompositions = async (
    prescriptionId: number,
): Promise<IShowPrescriptionComposition> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const result = await baseUrl.get<Response>(
        `/prescription/${prescriptionId}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );

    return result.data.data;
};
