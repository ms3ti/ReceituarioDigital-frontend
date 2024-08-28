import { baseUrl } from "./baseUrl";

export const recoveryPassword = async (email: string) => {
    await baseUrl.get(`auth/recovery/${email}`);
};
