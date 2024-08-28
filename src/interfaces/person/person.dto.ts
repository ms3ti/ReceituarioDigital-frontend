import { PersonTypeEnum } from "../../enum/person.type.enum";

export interface IPersonDto {
    id?: number;
    name: string;
    email: string;
    birthDate: string;
    cpf?: string;
    sex: string;
    socialName?: string;
    phoneNumber: string;
    personType: PersonTypeEnum;
    mothersName?: string;
    active?: boolean;
    createDate?: string;
    updateDate?: string;
    responsibleSocialName?: string;
    responsibleName?: string;
    responsibleCPF?: string;
}
