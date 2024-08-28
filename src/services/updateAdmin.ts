import { IPersonDto } from "../interfaces/person/person.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const updateAdmin = async (personId: number, payload: IPersonDto) => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    await baseUrl.put<Response>(`/person/admin/${personId}`, payload, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
};
