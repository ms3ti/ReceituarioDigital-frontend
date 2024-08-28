import { IPrescriptionCompositionDto } from "./prescription.composition.dto";

export interface IPrescriptionForEmergencyDto {
    person: {
        name: string;
    };
    prescriptionCompositons: IPrescriptionCompositionDto[];
    documentTypeId: number;
    date?: string;
    hour?: string;
    shouldShowDate: boolean;
}

export interface IPrescriptionResponseForEmergencyDto {
    buffer: string;
    fileName: string;
    prescriptionType: number;
}
