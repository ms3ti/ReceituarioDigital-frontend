export const loginErrorParser: { [x: string]: string } = {
    NotAuthorizedException: "Usuário e/ou senha inválidos",
    UserNotConfirmedException:
        "Aprovação pendente pela adm, por favor contatá-los",
    ForbiddenException: "Usuário está aguardando aprovação",
    HttpException:
        "Acesso bloqueado, entre em contato através do número (11) 9 5773-7070 para mais informações.",
    NotFoundException: "Usuário não cadastrado",
    UnauthorizedException: "Combinação email/senha incorreta!",
};
