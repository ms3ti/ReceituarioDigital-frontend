export enum PrescriptionTypeEnum {
    PRESCRIPTION = 1,
    CONTROLLED_RECIPE = 2,
    ANTIMICROBIAL_PRESCRIPTION = 3,
}

export const PrescriptionTypeIdToNameEnum: { [x: number]: string } = {
    1: "Receita Simples",
    2: "Receita Controlada",
    3: "Receita de Antimicrobiano",
};
