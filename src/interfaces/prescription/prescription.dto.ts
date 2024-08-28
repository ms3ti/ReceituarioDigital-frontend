import { IPersonDto } from "../person/person.dto";
import { IPrescriptionCompositionDto } from "./prescription.composition.dto";

export interface IPrescriptionDto {
    id: number;
    active: boolean;
    createDate?: string;
    updateDate?: string;
    idPrescriptionType: number;
    assigned: boolean;
    patientId: number;
    doctorId: number;
    person: IPersonDto;
    prescriptionCompositons: IPrescriptionCompositionDto[];
    documentTypeId: number;
    date?: string;
    hour?: string;
    idDocument: string;
    linkSigned: string;
    link: string;
    ownerAddressId?: number;
    shouldShowDate: boolean;
}
