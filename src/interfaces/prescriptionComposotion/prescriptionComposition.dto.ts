export interface IPrescriptionCompositionDto {
    prescriptionId: number;
    idPrescriptionType?: number;
    description: string;
    medicine: string | null;
    activePrinciple: string | null;
    dosage: string | null;
    packing: string | null;
    updateDate?: string;
    id: number;
    active: boolean;
    createDate?: string;
    isOrientation: boolean;
    isTitle: boolean;
    isContent: boolean;
    isJustification: boolean;
    examId: number;
    medicineId: number;
    quantity: number;
}
