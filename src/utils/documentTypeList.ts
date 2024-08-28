export const documentTypeList = [
    "Receita",
    "Pedido de exame",
    "Atestado Médico",
    "Outros",
];

export const documentTypeNameToId: { [x: string]: number } = {
    Receita: 1,
    "Pedido de exame": 2,
    "Atestado Médico": 3,
    Outros: 4,
};

export const documentTypeIdToName: { [x: number]: string } = {
    1: "Receita",
    2: "Pedido de exame",
    3: "Atestado Médico",
    4: "Outros",
};
