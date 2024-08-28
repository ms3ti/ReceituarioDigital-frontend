import {
    ICreatePatientDto,
    ICreatePatientReturnDto,
} from "../interfaces/patient/create.patient.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: ICreatePatientReturnDto;
}

export const savePatient = async (
    payload: ICreatePatientDto,
): Promise<ICreatePatientReturnDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.post<Response>("/person/patient", payload, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
