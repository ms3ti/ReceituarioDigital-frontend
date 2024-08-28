import { IAddressOwnerAddressPayloadDto } from "../interfaces/address/address.ownerAddress.payload.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IAddressOwnerAddressPayloadDto[];
}

export const listAddressByPersonId = async (
    personId: number,
): Promise<IAddressOwnerAddressPayloadDto[]> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(`/address/list/${personId}`, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
