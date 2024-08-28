import { IUpdateDoctorDto } from "../interfaces/doctor/update.doctor.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const updateDoctor = async (body: IUpdateDoctorDto): Promise<void> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    return await baseUrl.put("/doctor", body, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
