import {
    IPrescriptionResponseForEmergencyDto,
    IPrescriptionForEmergencyDto,
} from "../interfaces/prescription/IPrescriptionCreateEmergency.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPrescriptionResponseForEmergencyDto;
}

export const createEmergencyDoc = async (
    payload: IPrescriptionForEmergencyDto,
    doctorId: string,
): Promise<IPrescriptionResponseForEmergencyDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.post<Response>(
        `/prescription/generateEmergencyFile/${doctorId}`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
