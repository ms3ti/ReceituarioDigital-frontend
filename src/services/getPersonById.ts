import { IPersonDto } from "../interfaces/person/person.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPersonDto;
}

export const getPersonById = async (id: number): Promise<any> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(`/person/find/${id}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return [result.data.data];
};
