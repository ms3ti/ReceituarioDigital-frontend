import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { IPrescriptionDocumentDto } from "./../interfaces/prescription/prescription.document.dto";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPrescriptionDocumentDto;
}

export const getDocStatus = async (
    idDocument: string,
): Promise<IPrescriptionDocumentDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const result = await baseUrl.get<Response>(
        `/prescription/signature/check/${idDocument}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
