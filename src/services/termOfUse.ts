import { ITermDto } from "../interfaces/term/termOfUse.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: ITermDto;
}
export const getTermOfUse = async (type: number): Promise<ITermDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(`/term/${type}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });

    return result.data.data;
};
