import { ICreateAdminDto } from "../interfaces/admin/create.admin.dto";
import { IPersonDto } from "../interfaces/person/person.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IPersonDto;
}

export const createAdmin = async (
    body: ICreateAdminDto,
): Promise<IPersonDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.post<Response>(`/person/admin/`, body, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
