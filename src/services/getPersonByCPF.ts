import { IPatientDto } from "../interfaces/patient/patient.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPatientDto[];
}

export const getPersonByCPF = async (cpf: string): Promise<IPatientDto[]> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const result = await baseUrl.get<Response>(
        `/person/list/${cpf || "none"}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
