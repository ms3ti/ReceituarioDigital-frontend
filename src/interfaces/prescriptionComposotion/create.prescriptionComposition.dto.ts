export interface ICreatePrescriptionCompositionDto {
    medicine: string | null;
    activePrinciple: string | null;
    description: string | null;
    dosage: string | null;
    packing: string | null;
    orientation?: string | null;
    isOrientation: boolean;
    isContent: boolean;
    isTitle: boolean;
    isJustification: boolean;
    examId: number;
    medicineId: number;
    quantity: number;
}
