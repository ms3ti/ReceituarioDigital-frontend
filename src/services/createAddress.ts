import { ICreateAddressPayloadDto } from "../interfaces/address/create.address.payload.dto";
import { ICreatedAddressDto } from "../interfaces/address/created.address.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: ICreatedAddressDto;
}

export const createAddress = async (
    body: ICreateAddressPayloadDto,
): Promise<ICreatedAddressDto> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);
    const result = await baseUrl.post<Response>(`/address`, body, {
        headers: {
            Authorization: `Bearer ${String(token)}`,
        },
    });
    return result.data.data;
};
