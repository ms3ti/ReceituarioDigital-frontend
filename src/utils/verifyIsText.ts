import { ICreatePrescriptionCompositionDto } from "../interfaces/prescriptionComposotion/create.prescriptionComposition.dto";

export const verifyIsFreeText = (value: ICreatePrescriptionCompositionDto) =>
    (value?.medicine === null || value?.medicine === "") &&
    (value?.activePrinciple === null || value?.activePrinciple === "") &&
    (value?.dosage === null || value?.dosage === "") &&
    (value?.packing === null || value?.packing === "") &&
    value?.description !== null &&
    value?.description !== "" &&
    !value?.isOrientation &&
    !value?.isContent &&
    !value?.isTitle &&
    !value?.isJustification &&
    !value.medicineId &&
    !value.examId;

export const verifyIsFreeTextForOther = (
    value: ICreatePrescriptionCompositionDto,
) =>
    (value?.medicine === null || value?.medicine === "") &&
    (value?.activePrinciple === null || value?.activePrinciple === "") &&
    (value?.dosage === null || value?.dosage === "") &&
    (value?.packing === null || value?.packing === "") &&
    value?.description !== null &&
    value?.description !== "" &&
    !value.isJustification &&
    !value?.isOrientation &&
    (value?.isContent || value?.isTitle);

export const verifyIsEmptyFreeText = (
    value: ICreatePrescriptionCompositionDto,
) =>
    (value?.medicine === null || value?.medicine === "") &&
    (value?.activePrinciple === null || value?.activePrinciple === "") &&
    (value?.dosage === null || value?.dosage === "") &&
    (value?.packing === null || value?.packing === "") &&
    (value?.description === null || value?.description === "") &&
    !value?.isOrientation &&
    !value?.isContent &&
    !value?.isTitle &&
    !value.isJustification &&
    !value.examId;

export const verifyIsEmpty = (value: ICreatePrescriptionCompositionDto) =>
    (value?.medicine === null || value?.medicine === "") &&
    (value?.activePrinciple === null || value?.activePrinciple === "") &&
    (value?.dosage === null || value?.dosage === "") &&
    (value?.packing === null || value?.packing === "") &&
    (value?.description === null || value?.description === "") &&
    value.examId === 0 &&
    value.medicineId === 0;

export const verifyIsOrientation = (value: ICreatePrescriptionCompositionDto) =>
    (value?.medicine === null || value?.medicine === "") &&
    (value?.activePrinciple === null || value?.activePrinciple === "") &&
    (value?.dosage === null || value?.dosage === "") &&
    (value?.packing === null || value?.packing === "") &&
    value?.description !== null &&
    value?.description !== "" &&
    !value?.isOrientation &&
    !value.isContent &&
    !value.isTitle &&
    !value.isJustification;
