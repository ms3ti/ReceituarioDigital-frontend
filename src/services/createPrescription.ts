import {
    ICreatePrescriptionDto,
    ICreatePrescriptionResponseDto,
} from "../interfaces/prescription/create.prescription.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: ICreatePrescriptionResponseDto;
}

export const createPrescription = async (
    payload: ICreatePrescriptionDto,
): Promise<ICreatePrescriptionResponseDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.post<Response>(`/prescription`, payload, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
