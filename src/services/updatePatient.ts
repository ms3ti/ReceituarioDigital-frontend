import { IUpdatePatientById } from "../interfaces/patient/update.patient.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { removeMask } from "../utils/removeMask";
import { baseUrl } from "./baseUrl";

interface Response {
    data: null;
}

export const updatePatient = async (
    payload: IUpdatePatientById,
): Promise<void> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    payload.cpf = removeMask.cpf(payload.cpf);
    await baseUrl.put<Response>("/patient", payload, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
