import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { IDoctorDto } from "./../interfaces/doctor/doctor.dto";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IDoctorDto;
}

export const getDoctorByEmail = async (email: string): Promise<IDoctorDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const result = await baseUrl.get<Response>(`/doctor/login/${email}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
