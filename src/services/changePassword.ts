import { IChangePasswordPayloadDto } from "../interfaces/user/change.password.payload.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: string;
}

export const changePassword = async (
    payload: IChangePasswordPayloadDto,
): Promise<string> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.post<Response>(
        `/auth/changePassword`,
        payload,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
