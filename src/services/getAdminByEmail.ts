import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";
import { IPersonDto } from "../interfaces/person/person.dto";
import { IDoctorDto } from "../interfaces/doctor/doctor.dto";

interface Response {
    data: IPersonDto | IDoctorDto;
}

export const getAdminByEmail = async (email: string): Promise<any> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const result = await baseUrl.get<Response>(`/person/login/${email}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
