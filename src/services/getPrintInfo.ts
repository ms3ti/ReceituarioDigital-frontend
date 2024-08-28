import { IPrescriptionPDFBufferDto } from "../interfaces/prescription/IPrescriptionPDFBuffer.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPrescriptionPDFBufferDto;
}

export const getPrintInfo = async (
    prescriptionId: string | number,
): Promise<IPrescriptionPDFBufferDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(
        `/prescription/${prescriptionId}/generatePDF`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
