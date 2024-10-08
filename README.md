<img style=" width: 162px; mix-blend-mode: multiply;" src="https://github.com/ms3ti/ReceituarioDigital-backend/blob/main/src/assets/mrd-logo-300px.png?raw=true" alt="MRD">


------


## Descrição

A aplicação foi criada usando React com TypeScript e [Chakra-UI](https://chakra-ui.com/) para criação dos componentes.

## Pré-requisitos

* Node v16.18.1


## Como rodar

```bash

# Instale as dependências
$ npm install --force

# Rode o servidor
$ npm start
```


## Scripts

| Script      | Função |
| ----------- | ----------- |
| build | Gera o build da aplicação |
| format | Formata o código |
| start | Inicia o servidor de dev |
| dev | Inicia o servidor de dev no watch mode |
| lint | Roda o ESLint no projeto


## Adm

Os médicos que também tem acesso a área de administrador estão definidos em um array na pasta `src/utils/validAdminEmails.ts` a principio apenas o e-mail da Heldy estará lá e os outros administradores podem ser criados na aba administradores da aplicação.
