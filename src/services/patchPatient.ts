import { IPatchPatientDto } from "../interfaces/patient/patch.patient.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: string;
}

export const patchPatient = async (
    patienId: string,
    payload: IPatchPatientDto,
): Promise<void> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const doctorId = await asyncLocalStorage.getItem(
        localStorageKeys.DOCTOR_ID,
    );
    payload.doctorId = Number(doctorId);

    await baseUrl.patch<Response>(`/patient/${patienId}`, payload, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
