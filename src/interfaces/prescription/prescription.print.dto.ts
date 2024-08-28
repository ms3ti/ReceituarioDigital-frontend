import { IDoctorDto } from "../doctor/doctor.dto";
import { IPatientAddressDto } from "../patient/patient.address.dto";
import { IPrescriptionDto } from "./prescription.dto";

export interface IPrescriptionForPrint {
    prescription: IPrescriptionDto;
    doctor: IDoctorDto;
    patientAddress: IPatientAddressDto;
}
