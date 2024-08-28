import axios from "axios";
import { ViaCepAddressDto } from "../interfaces/person/viacepAddres.dto";

export const getAddress = async (cep: string): Promise<ViaCepAddressDto> => {
    const result = await axios.get<ViaCepAddressDto>(
        `https://viacep.com.br/ws/${cep}/json/`,
    );
    return result.data;
};
