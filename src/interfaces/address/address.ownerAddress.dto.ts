export interface IAddressOwnerAddressDto {
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    cep: string;
    city: string;
    street: string;
    number: string;
    complement: string;
    state: string;
    district: string;
    addressId: number;
    ownerAddressId: number;
    id?: number;
    active?: boolean;
    createDate?: string;
    updateDate?: string;
    idPerson?: number;
    idAdress?: number;
    cnpj?: string;
    isDefault?: boolean;
    ownerPhone2?: string;
    imageName?: string;
}
