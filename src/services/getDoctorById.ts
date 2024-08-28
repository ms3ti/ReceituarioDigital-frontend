import { IDoctorDto } from "../interfaces/doctor/doctor.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IDoctorDto;
}

export const getDoctorById = async (id: number): Promise<IDoctorDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const result = await baseUrl.get<Response>(`/doctor/${id}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
