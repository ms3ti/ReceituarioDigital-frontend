import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: any;
}

export const updateSignDocument = async (
    prescriptionId: number,
    status: boolean,
): Promise<any> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.patch<Response>(
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
