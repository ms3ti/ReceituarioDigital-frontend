import { MakeUserPayload } from "../../types/MakeUserPayload";
import { ICreatePatientDto } from "../patient/create.patient.dto";

export interface ICreateUsers extends MakeUserPayload, ICreatePatientDto {}
