export interface IUpdatePrescriptionCompositionDto {
    id?: number;
    prescriptionCompositionId?: number;
    description: string;
    medicine: string;
    activePrinciple: string;
    dosage: string;
    packing: string;
    updateDate: string;
    isOrientation: boolean;
    isContent: boolean;
    isTitle: boolean;
    isJustification: boolean;
    examId: number;
}
