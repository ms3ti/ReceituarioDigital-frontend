import { IDoctorDto } from "../interfaces/doctor/doctor.dto";

export const doctorMock: IDoctorDto = {
    birthDate: "1999-01-11T02:00:00.000Z",
    cpf: "44057310800",
    email: "medicoteste@meureceituariodigital.com.br",
    mothersName: "",
    name: "jeff silva",
    personType: 2,
    phoneNumber: "13988082987",
    socialName: "social name",
    personId: 1,
    councilType: 1,
    councilUf: "SP",
    crm: "123123",
    sex: "Masculino",
    imageUrl:
        "https://mrd-bucket.s3.us-west-2.amazonaws.com/logo/4/74/855309c6-83ee-4c1d-98ec-12a4224787cf.jpg",
    doctorSpecialty: [
        {
            id: 1,
            active: true,
            createDate: "2022-11-11T22:48:44.209Z",
            updateDate: "2022-11-11T22:48:44.209Z",
            idDoctor: 1,
            specialty: "cardiologista",
            registrationNumber: "123123123123123123",
        },
        {
            id: 2,
            active: true,
            createDate: "2022-11-11T22:48:53.643Z",
            updateDate: "2022-11-11T22:48:53.643Z",
            idDoctor: 1,
            specialty: "pediatra",
            registrationNumber: "123123123123123123",
        },
    ],
    doctorId: 1,
    address: {
        ownerAddressId: 1,
        addressId: 1,
        cep: "0000000",
        city: "guaruja",
        complement: "3 ruas pra lá e 3 pra cá",
        district: "limoeiro",
        number: "0",
        ownerEmail: "clinica.deuses@deus.god",
        ownerName: "Clinica dos deuses",
        ownerPhone: "6928574014",
        state: "SP",
        street: "dos bobos",
    },
};
