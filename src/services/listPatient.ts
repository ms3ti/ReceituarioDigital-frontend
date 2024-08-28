import { IListPatient } from "../interfaces/patient/create.patient.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IListPatient[];
}

export const listPatient = async (
    doctorId: number,
    queryParam: string,
): Promise<IListPatient[]> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(
        `/patient/doctor/${doctorId}?query=${queryParam}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
