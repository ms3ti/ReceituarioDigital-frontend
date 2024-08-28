export interface IPrescriptionReturnDto {
    id: number;
    patientName: string;
    createDate: string;
    assignDate: string;
    assigned: boolean;
    documentTypeId: number;
    idPrescriptionType: number;
    shouldShowDate: boolean;
}
export interface IPrescriptionsOrganizedByDateDto {
    [x: string]: IPrescriptionReturnDto[];
}
