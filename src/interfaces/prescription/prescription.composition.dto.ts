export interface IPrescriptionCompositionDto {
    id: number;
    active: boolean;
    createDate?: string;
    updateDate?: string;
    prescriptionId: number;
    description: string;
    medicine: string | null;
    activePrinciple: string | null;
    dosage: string | null;
    packing: string | null;
    isOrientation: boolean;
    isTitle: boolean;
    isContent: boolean;
    isJustification: boolean;
    examId: number;
    medicineId: number;
    quantity: number;
}
