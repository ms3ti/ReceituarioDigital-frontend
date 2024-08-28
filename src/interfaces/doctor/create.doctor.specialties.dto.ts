export interface ICreateDoctorSpecialtiesDto {
    [x: string]: string | number | undefined;
    id?: number;
    idDoctor?: number;
    specialty?: string;
    registrationNumber?: string;
}
