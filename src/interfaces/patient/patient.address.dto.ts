export interface IPatientAddressDto {
    id: number;
    active: boolean;
    createDate: string;
    updateDate: string;
    cep: string;
    city: string;
    street: string;
    number: string;
    complement: string;
    state: string;
    district: string;
}
