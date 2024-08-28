export interface ICreateAddressDto {
    state: string;
    cep: string;
    city: string;
    district: string;
    street: string;
    cnpj?: string;
    number: string;
    complement?: string;
    ownerName?: string;
    ownerPhone?: string;
    ownerPhone2?: string;
    ownerEmail?: string;
}
