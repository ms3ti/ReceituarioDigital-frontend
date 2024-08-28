import { IPersonDto } from "../interfaces/person/person.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPersonDto;
}

export const getAdminByPersonId = async (
    personId: number,
): Promise<IPersonDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(`/person/admin/${personId}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
