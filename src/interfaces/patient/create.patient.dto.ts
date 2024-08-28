import { PersonTypeEnum } from "../../enum/person.type.enum";
import { ICreatePersonDto } from "../person/create.person.dto";
import { IPatientAddressDto } from "./patient.dto";

export interface ICreatePatientDto extends ICreatePersonDto {
    idDoctor: number;
}

export interface ICreatePatientReturnDto {
    address: {
        cep: string;
        city: string;
        street: string;
        number: string;
        complement: string;
        state: string;
        district: string;
        updateDate: string;
        id: number;
        active: boolean;
        createDate: string;
    };
    personType: PersonTypeEnum;
    name: string;
    socialName: string;
    cpf: string;
    sex: string;
    phoneNumber: string;
    email: string;
    birthDate: string;
    mothersName: string;
    updateDate: string;
    id: number;
    active: boolean;
    createDate: string;
}

export interface IListPatient {
    id: number;
    active: boolean;
    createDate: string;
    updateDate: string;
    personType: number;
    name: string;
    socialName: string;
    cpf: string;
    sex: string;
    phoneNumber: string;
    email: string;
    birthDate: string;
    mothersName: string;
    patientId: number;
    responsibleSocialName?: string;
    responsibleName?: string;
    responsibleCPF?: string;
    responsibleBirthDate?: string;
    responsibleMothersName?: string;
    responsibleSex?: string;
    hasResponsible?: boolean;
    address: IPatientAddressDto
}
