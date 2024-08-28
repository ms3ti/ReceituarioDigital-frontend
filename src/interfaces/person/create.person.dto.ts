import { ICreateAddressDto } from "../address/create.address.dto";

export interface ICreatePersonDto {
    name: string;
    email: string;
    birthDate: undefined | string;
    cpf?: string;
    sex?: string;
    socialName?: string;
    phoneNumber: string;
    personType: number;
    address: ICreateAddressDto;
    mothersName?: string;
    responsibleSocialName?: string;
    responsibleName?: string;
    responsibleCPF?: string;
}
