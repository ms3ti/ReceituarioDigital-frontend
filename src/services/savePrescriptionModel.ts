import { ICreatePrescriptionModelDto } from "./../interfaces/prescriptionModel/create.prescriptionModel.dto";
import { ICreateDoctorReturnDto } from "../interfaces/doctor/create.doctor.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: ICreateDoctorReturnDto;
}
export const savePrescriptionModel = async (
    payload: ICreatePrescriptionModelDto,
): Promise<ICreateDoctorReturnDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.post<Response>("/prescriptionModel", payload, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
