import { DocumentTypeEnum } from "../../utils/enum/document.type.enum";
import { PrescriptionTypeEnum } from "../../utils/enum/prescription.type.enum";
import { ICreatePrescriptionCompositionDto } from "../prescriptionComposotion/create.prescriptionComposition.dto";
import { IPrescriptionCompositionDto } from "../prescriptionComposotion/prescriptionComposition.dto";

export interface ICreatePrescriptionDto {
    patientId?: number;
    doctorId: number;
    prescriptionType?: PrescriptionTypeEnum;
    prescriptionComposition: ICreatePrescriptionCompositionDto[];
    documentTypeId: DocumentTypeEnum;
    date?: string;
    hour?: string;
    signed?: boolean;
    idDocument?: string;
    shouldShowDate: boolean;
}

export interface ICreatePrescriptionResponseDto {
    active: boolean;
    createDate: string;
    idPrescriptionType: number;
    assigned: boolean;
    patientId: number;
    updateDate: string;
    id: number;
    prescriptionComposition: IPrescriptionCompositionDto[];
    link: string;
    linkSigned: string;
    idDocument?: string;
}
