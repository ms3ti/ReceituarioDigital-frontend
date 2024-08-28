import { PrescriptionTypeEnum } from "../../utils/enum/prescription.type.enum";
import { IPersonDto } from "../person/person.dto";
import { IUpdatePrescriptionCompositionDto } from "./update.prescription.composition.dto";

export interface IUpdatePrescriptionDto {
    prescriptionId: number;
    patientId: number;
    doctorId: number;
    prescriptionComposition: IUpdatePrescriptionCompositionDto[];
    ownerAddressId: number;
    documentTypeId: number;
    hour: string;
    idPrescriptionType: PrescriptionTypeEnum;
    date: string;
    updateDate: Date;
    assigned: boolean;
    active: boolean;
    person: IPersonDto[];
    shouldShowDate: boolean;
}
