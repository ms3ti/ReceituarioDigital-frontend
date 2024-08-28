import { IListPatient } from "../interfaces/patient/create.patient.dto";

export const result: IListPatient[] = [
    {
        id: 19,
        active: true,
        createDate: "2022-11-11T17:25:45.525Z",
        updateDate: "2022-11-11T17:25:45.525Z",
        personType: 1,
        name: "Ricardo da Silva",
        socialName: "Zé",
        cpf: "44057310800",
        sex: "Masculino",
        phoneNumber: "13988082987",
        email: "zeze@gmail.com",
        birthDate: "1999-01-10T02:00:00.000Z",
        mothersName: "Rosineide Silva",
        patientId: 8,
        address: {
            addressId: 6,
            ownerAddressId: 6,
            cep: "11443-130",
            city: "Guarujá",
            complement: "",
            district: "Jardim Enseada",
            number: "23",
            ownerEmail: "",
            ownerName: "",
            ownerPhone: "",
            state: "SP",
            street: "Rua Araguaçu",
        },
    },
];
