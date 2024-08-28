import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: {
        link: string;
        signature: {
            idDocument: string;
            url: string;
        };
    };
}

export const signDocument = async (
    prescriptionId: number,
    status: boolean,
): Promise<{
    link: string;
    signature: {
        idDocument: string;
        url: string;
    };
}> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.post<Response>(
        `/prescription/sign/${prescriptionId}?status=${status}`,
        null,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
