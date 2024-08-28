export const removeMask = {
    ownerPhone: (value: string) =>
        value
            .replace("(", "")
            .replace(")", "")
            .replace(")", "")
            .replace("-", "")
            .replace(" ", ""),

    cnpj: (value: string) =>
        value.replaceAll(".", "").replace("/", "").replace("-", ""),
    cep: (value: string) =>
        value.replaceAll(".", "").replace("/", "").replace("-", ""),
    cpf: (value: string) => value.replaceAll(".", "").replaceAll("-", ""),
    whatsPhone: (value: string) =>
        value
            .replaceAll(" ", "")
            .replace("(", "")
            .replace(")", "")
            .replace("-", ""),
};
