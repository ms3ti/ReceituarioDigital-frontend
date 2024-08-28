import { ICreateDoctorReturnDto } from "../interfaces/doctor/create.doctor.dto";
import { ICreatePersonDto } from "../interfaces/person/create.person.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: ICreateDoctorReturnDto;
}
export const saveDoctor = async (
    payload: ICreatePersonDto,
): Promise<ICreateDoctorReturnDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.post<Response>("/person/doctor", payload, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
