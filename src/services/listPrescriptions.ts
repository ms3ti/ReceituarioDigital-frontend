import { IPrescriptionsOrganizedByDateDto } from "../interfaces/prescription/list.prescription.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";

import { baseUrl } from "./baseUrl";

interface Response {
    data: IPrescriptionsOrganizedByDateDto;
}

export const listPrescription = async (
    doctorId: number,
    total: number,
    page: number,
    patientName: string,
    animal = "",
    searchType: "Tutor" | "Animal" | "Ambos",
): Promise<IPrescriptionsOrganizedByDateDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(
        `/prescription/history/${doctorId}/${total}/${page}?searchType=${searchType}&patientName=${patientName}&animal=${animal}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
