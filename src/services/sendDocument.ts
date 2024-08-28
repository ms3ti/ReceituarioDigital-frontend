import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: { whatsLink: string };
}

export const sendDocument = async (
    prescriptionId: number,
    email: string,
    smsNumber: string,
    whatsNumber: string,
): Promise<{ whatsLink: string }> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(
        `prescription/${prescriptionId}/sendDocument?email=${email}&phone=${smsNumber}&whatsNumber=${whatsNumber}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
