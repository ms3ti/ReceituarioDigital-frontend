import axios from "axios";
import { localStorageKeys } from "../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../utils/fetchLocalStorageData";

const env = {
    local: "http://localhost:3333",
    dev: "https://mrd-api-dev.certsys.io",
    hlg: "https://mrd-api-hlg.certsys.io",
    prd: "https://api-mrd.meureceituariodigital.com.br",
};

const baseUrl = axios.create({
baseURL: env.prd,
});

baseUrl.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response.status === 401) {
            const token = await asyncLocalStorage.getItem(
                localStorageKeys.TOKEN,
            );
            if (!token) {
                window.location.replace("/?expired=true");
            }
        }
        if ([409, 500].includes(error.response.status)) {
            throw error.response.data;
        }

        return error;
    },
);

export { baseUrl };
