import { PrescriptionTypeEnum } from "../../utils/enum/prescription.type.enum";

export interface IPrescriptionPDFBufferDto {
    buffer: string;
    fileName: string;
    prescriptionType: PrescriptionTypeEnum;
}
