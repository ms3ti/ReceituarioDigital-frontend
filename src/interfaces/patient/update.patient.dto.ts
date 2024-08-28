export interface IUpdatePatientById {
    cpf: string;
    name: string;
    mothersName: string;
    birthDate: string;
    email: string;
    phoneNumber: string;
    personType: number;
    socialName: string;
    sex: string;
    patientId: number;
    personId: number;
    address: {
        addressId: number;
        ownerAddressId: number;
        cep: string;
        city: string;
        district: string;
        street: string;
        number: string;
        complement: string;
        state: string;
        ownerName: string | null;
        ownerEmail: string | null;
        ownerPhone: string | null;
    };
}
