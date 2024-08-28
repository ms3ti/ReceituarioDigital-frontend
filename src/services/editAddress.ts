import { ICreateAddressPayloadDto } from "../interfaces/address/create.address.payload.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

export const editAddress = async (body: ICreateAddressPayloadDto) => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.put(`/address`, body, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
