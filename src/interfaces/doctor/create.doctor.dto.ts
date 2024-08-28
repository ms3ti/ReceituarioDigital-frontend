import { PersonTypeEnum } from "../../enum/person.type.enum";
import { ICreatePersonDto } from "../person/create.person.dto";
import { ICreateDoctorSpecialtiesDto } from "./create.doctor.specialties.dto";

export interface ICreateDoctorDto extends ICreatePersonDto {
    id?: number;
    idPerson?: number;
    crm: string;
    doctorSpecialty: ICreateDoctorSpecialtiesDto[];
    password: string;
}

export interface ICreateDoctorReturnDto {
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
        ownerAddressId: number;
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
    doctorId: number;
}
