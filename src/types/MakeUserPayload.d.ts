import { Optional } from "./optional";
import { ICreateDoctorDto } from "../interfaces/doctor/create.doctor.dto";

export type MakeUserPayload = Optional<
    ICreateDoctorDto,
    "doctorSpecialty" | "crm"
>;
