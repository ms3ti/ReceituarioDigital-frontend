export interface IAddressOwnerAddressPayloadDto {
    ownerAddressId: number;
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
    idPerson: number;
    idAdress: number;
    cnpj: string;
    isDefault: boolean;
    ownerName: string;
    ownerPhone: string;
    ownerPhone2: string;
    ownerEmail: string;
    imageUrl: string;
}
