import { ILoginDto } from "../interfaces/user/login.dto";
import { baseUrl } from "./baseUrl";

interface Response {
    data: ILoginDto;
}

export const login = async (body: {
    email: string;
    password: string;
}): Promise<ILoginDto> => {
    const result = await baseUrl.post<Response>(`/auth/login`, body);
    return result.data.data;
};
