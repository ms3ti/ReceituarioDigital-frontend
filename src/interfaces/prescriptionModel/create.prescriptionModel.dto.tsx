import { IPrescriptionCompositionModelDto } from "../prescriptionModel/prescriptionCompositionModel.dto";

export interface ICreatePrescriptionModelDto {
    doctorId: number;
    title: string;
    prescriptionComposition: IPrescriptionCompositionModelDto[];
    prescriptionType: number;
    documentTypeId: number;
    date: string;
    hour: string;
}
