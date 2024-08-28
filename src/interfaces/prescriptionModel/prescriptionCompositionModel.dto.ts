export interface IPrescriptionCompositionModelDto {
    description: string;
    medicine: string;
    activePrinciple: string;
    dosage: string;
    packing: string;
}

export interface IPrescriptionCompositionModel {
    id: number;
    active: boolean;
    createDate: string;
    updateDate: string;
    prescriptionModelId: number;
    description: string;
    medicine: string;
    activePrinciple: string;
    dosage: string;
    packing: string;
    isContent: boolean;
    isTitle: boolean;
    isOrientation: boolean;
    isJustification: boolean;
    examId: number;
    medicineId: number;
    quantity: number;
}
export interface IPrescriptionModel {
    id: number;
    active: boolean;
    createDate: string;
    updateDate: string;
    idPrescriptionType: number;
    doctorId: number;
    title: string;
    prescriptionCompositonsModels: IPrescriptionCompositionModel[];
    date: string;
    hour: string;
    documentTypeId: number;
}
