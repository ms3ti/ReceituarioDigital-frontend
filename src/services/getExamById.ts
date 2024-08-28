import { IMedicalExamDto } from "../interfaces/prescription/medical.exam.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IMedicalExamDto;
}

export const getExamById = async (examId: number): Promise<IMedicalExamDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(`/prescription/exam/${examId}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
