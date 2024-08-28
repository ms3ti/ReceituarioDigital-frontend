export enum DocumentTypeNameEnum {
    PRESCRIPTION = "Receita",
    EXAM_REQUEST = "Pedido de exame",
    CERTIFICATE = "Atestado Médico",
    OTHERS = "Outros",
}

export const DocumentNameParser: { [x: number]: string } = {
    1: "Receita",
    2: "Pedido de exame",
    3: "Atestado Médico",
    4: "Outros",
};
