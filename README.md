# MoneyTrack

Aplicação de finanças pessoais desenvolvida com React, Vite, React Router, Recharts e uma API de demonstração com JSON Server. Este é um projeto acadêmico, não um serviço financeiro.

## Executar localmente

Requisitos: Node.js 20.19+ e npm.

```sh
npm install
npm run dev:api
```

Em outro terminal:

```sh
npm run dev
```

O Vite inicia em `http://localhost:5173` e encaminha as chamadas de `/api` para o JSON Server em `http://localhost:3001`. O JSON Server grava as alterações em `db.json`.

## Conta de demonstração

- E-mail: `alex@example.com`
- Senha: `moneytrack`

Na tela de acesso, o botão **Preencher dados de demonstração** completa esses dados. Há também uma segunda conta isolada: `jamie@example.com`, com a mesma senha.

## Funcionalidades

- Painel com receitas, despesas e saldo do mês, transações recentes, gráficos por categoria e fluxo financeiro.
- Criar, editar e excluir transações; pesquisar descrições e filtrar por tipo, categoria e mês.
- Criar categorias pessoais e definir orçamentos mensais por categoria, com avisos de limite próximo ou ultrapassado.
- Editar nome e e-mail do perfil, validar cadastro e encerrar a sessão.
- Cada transação, categoria e orçamento pertence a um usuário (`userId`); as telas consultam e exibem somente os registros da conta autenticada.

## Aviso de segurança

Este projeto usa intencionalmente um banco JSON simples e autenticação ilustrativa para fins acadêmicos. A base de demonstração inclui credenciais de exemplo, e senhas de novas contas são enviadas à API simulada. **Não use credenciais reais nem dados financeiros sensíveis.** A sessão salva no LocalStorage contém somente o ID, o nome e o e-mail do usuário — nunca a senha. O JSON Server não oferece autorização no servidor; esta demonstração não é adequada para produção.

## Verificações

```sh
npm run lint
npm run build
```
