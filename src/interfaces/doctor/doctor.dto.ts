import { PersonTypeEnum } from "../../enum/person.type.enum";
import { IAddressOwnerAddressDto } from "../address/address.ownerAddress.dto";
import { IDoctorSpecialityDto } from "./doctor.speciality.dto";

export interface IDoctorDto {
    crm: string;
    doctorSpecialty: IDoctorSpecialityDto[];
    doctorId: number;
    personType: PersonTypeEnum;
    name: string;
    socialName: string;
    cpf: string;
    phoneNumber: string;
    email: string;
    birthDate: string;
    mothersName?: string;
    address: IAddressOwnerAddressDto;
    personId: number;
    councilType: number;
    councilUf: string;
    sex: string;
    imageUrl: string;
    id?: number;
    active?: boolean;
    createDate?: string;
    updateDate?: string;
    idPerson?: number;
}
