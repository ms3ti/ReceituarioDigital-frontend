export interface IMedicineDto {
    substance: string;
    product: string;
    presentation: string;
    therapeuticClass: string;
    class: string;
    accept: boolean;
    id: number;
    active: boolean;
    createDate?: Date;
    updateDate?: Date;
}
