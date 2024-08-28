export interface ICpfApiResponse {
    status: number;
    cpf: string;
    nome: string;
    pacoteUsado: number;
    saldo: number;
    consultaID: string;
    delay: number;
}
