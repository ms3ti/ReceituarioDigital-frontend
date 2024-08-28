import { IMedicineDto } from "../interfaces/prescription/medicine.dto";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";
import { baseUrl } from "./baseUrl";

interface Response {
    data: IMedicineDto[];
}

export const listMedicine = async (name: string): Promise<IMedicineDto[]> => {
    const token = await asyncLocalStorage.getItem(localStorageKeys.TOKEN);

    const result = await baseUrl.get<Response>(
        `/prescription/listMedicine?name=${name}`,
        {
            headers: {
                Authorization: `Bearer ${String(token)}`,
            },
        },
    );
    return result.data.data;
};
