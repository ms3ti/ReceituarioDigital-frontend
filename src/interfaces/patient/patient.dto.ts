export interface IPatientAddressDto {
    [x: string]: string | number;
    addressId: number;
    ownerAddressId: number;
    cep: string;
    city: string;
    district: string;
    street: string;
    number: string;
    complement: string;
    state: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
}

export interface IPatientDto {
    cpf: string;
    name: string;
    mothersName: string;
    birthDate: string;
    email: string;
    phoneNumber: string;
    personType: number;
    socialName: string;
    personId: number;
    patientId: number;
    sex: string;
    id: number;
    active: boolean;
    createDate: string;
    updateDate: string;
    responsibleSocialName: string;
    responsibleName: string;
    responsibleCPF: string;
    responsibleBirthDate: string;
    responsibleMothersName: string;
    responsibleSex: string;
    address: IPatientAddressDto;
    hasResponsible: boolean;
}
