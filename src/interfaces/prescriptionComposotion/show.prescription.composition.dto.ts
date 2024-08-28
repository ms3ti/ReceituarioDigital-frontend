import { IPrescriptionCompositionDto } from "./prescriptionComposition.dto";

interface IShortInfoPerson {
    active: boolean;
    birthDate: string;
    cpf: string;
    createDate: string;
    email: string;
    id: number;
    mothersName: string;
    name: string;
    personType: number;
    phoneNumber: string;
    sex: string;
    socialName: string;
    updateDate: string;
}
export interface IShowPrescriptionComposition {
    prescriptionCompositons: IPrescriptionCompositionDto[];
    person: IShortInfoPerson[];
    updateDate: string;
    active: boolean;
    assigned: boolean;
    createDate: string;
    date: string;
    doctorId: number;
    documentTypeId: number;
    hour: string;
    id: number;
    idPrescriptionType: number;
    link: string;
    ownerAddressId: number;
    patientId: number;
}
