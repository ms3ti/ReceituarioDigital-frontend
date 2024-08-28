import { IPatientDto } from "../interfaces/patient/patient.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPatientDto;
}

export const getPatientByCPF = async (
    cpf: string,
    doctorId: number,
): Promise<IPatientDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const result = await baseUrl.get<Response>(
        `/patient/cpf/${cpf}?doctorId=${doctorId}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result?.data?.data;
};
