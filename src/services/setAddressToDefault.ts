import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: {};
}

export const setAddressToDefault = async (
    ownerAddressId: number,
): Promise<{}> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const personId = await asyncLocalStorage.getItem(
        localStorageKeys.PERSON_ID,
    );

    const result = await baseUrl.post<Response>(
        `/address/${String(personId).replaceAll(
            '"',
            "",
        )}/default/${ownerAddressId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
