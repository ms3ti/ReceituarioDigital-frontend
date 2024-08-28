import { ICreatePrescriptionCompositionDto } from "../interfaces/prescriptionComposotion/create.prescriptionComposition.dto";

export function formatCompositions(
    values: ICreatePrescriptionCompositionDto[],
): ICreatePrescriptionCompositionDto[] {
    return values.map((composition) => {
        let prescriptionComposition;
        if (composition && Object.keys(composition).length === 1) {
            prescriptionComposition = {
                activePrinciple: composition.activePrinciple
                    ? composition.activePrinciple
                    : null,
                description: composition.description
                    ? composition.description
                    : null,
                dosage: composition.dosage ? composition.dosage : null,
                medicine: composition.medicine ? composition.medicine : null,
                packing: composition.packing ? composition.packing : null,
                orientation: composition.orientation
                    ? composition.orientation
                    : null,
                isOrientation: composition.isOrientation
                    ? composition.isOrientation
                    : false,
                isContent: composition.isContent
                    ? composition.isContent
                    : false,
                examId: composition.examId,
                isTitle: composition.isTitle ? composition.isTitle : false,
                isJustification: composition.isJustification
                    ? composition.isJustification
                    : false,
                medicineId: composition.medicineId,
                quantity: composition.quantity,
            };
        } else {
            prescriptionComposition = composition;
        }
        return prescriptionComposition;
    });
}
