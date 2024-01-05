# Claro Faturas API

Este é um projeto simples para buscar e exibir informações de faturas da Claro Residencial. Ele consiste em duas partes: um servidor Express.js para lidar com as solicitações da API da Claro e um front-end React para interação do usuário.

## Configuração

1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em seu ambiente.
2. Clone este repositório para o seu ambiente local.

```bash
git clone https://github.com/Squifordl/faturas-claro.git
cd claro-faturas-api
```

## Instale as dependências para o servidor e o front-end.

```bash
cd server
npm install

cd ../frontend
npm install
```

## Inicie o servidor Express e o front-end React.

No diretório server:

```bash
npm start
```

No diretório frontend:

```bash
npm start
```

    Abra o navegador e vá para http://localhost:3000 para acessar a aplicação.

## Uso

    Insira o CPF do cliente na caixa de entrada.
    Clique no botão "Buscar Fatura" para obter informações sobre as faturas do cliente.

## Estrutura do Projeto

    server/index.js: Servidor Express que lida com solicitações para a API da Claro.
    frontend/src/Faturas.js: Componente React que permite ao usuário buscar e exibir faturas.

## Notas Importantes

    Certifique-se de tratar as chaves de API de maneira segura, especialmente ao implantar a aplicação em um ambiente de produção.
    Este projeto assume a disponibilidade contínua da API da Claro Residencial. Mudanças na API podem afetar o funcionamento deste projeto.
## Este documento foi gerado por um assistente de linguagem AI.
