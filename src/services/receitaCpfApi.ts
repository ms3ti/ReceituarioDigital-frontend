import axios from "axios";
import { ICpfApiResponse } from "../interfaces/person/cpfApi.dto";
import { removeMask } from "../utils/removeMask";

export const receitaCpfApi = async (cpf: string): Promise<ICpfApiResponse> => {
    const token = "0d60b6f63954067e016d9cfb6adf8373";
    const pacote = "1";
    const result = await axios.get<ICpfApiResponse>(
        `https://api.cpfcnpj.com.br/${token}/${pacote}/${removeMask.cpf(cpf)}`,
    );
    return result.data;
};
