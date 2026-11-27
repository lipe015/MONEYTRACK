# MoneyTrack

Aplicação de finanças pessoais desenvolvida com React, Vite, React Router, Recharts e uma API de demonstração com JSON Server. Este é um projeto académico, não um serviço financeiro. Os valores são apresentados em euros.

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

## Publicação no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` publica automaticamente uma demonstração estática quando há alterações na branch `lipe015-moneytrack-finance-app`. No repositório, configure **Settings → Pages → Build and deployment → Source: GitHub Actions**. Após a primeira execução bem-sucedida, o site ficará disponível em `https://lipe015.github.io/MONEYTRACK/`.

Na versão publicada, o frontend usa uma API simulada no navegador: as alterações ficam no armazenamento local do browser e não sincronizam entre dispositivos. A demonstração aceita apenas as contas de exemplo indicadas acima; não regista novas contas nem guarda palavras-passe no armazenamento local. O site é apenas para demonstração e não deve receber dados financeiros reais.

## Conta de demonstração

- E-mail: `alex@example.com`
- Senha: `moneytrack`

No ecrã de acesso, o botão **Preencher dados de demonstração** completa estes dados. Existe também uma segunda conta isolada: `jamie@example.com`, com a mesma palavra-passe.

## Funcionalidades

- Painel com rendimentos, despesas e saldo do mês, transações recentes, gráficos por categoria e fluxo financeiro.
- Criar, editar e eliminar transações; pesquisar descrições e filtrar por tipo, categoria e mês.
- Criar categorias pessoais e definir orçamentos mensais por categoria, com avisos de limite próximo ou ultrapassado.
- Editar o nome e o e-mail do perfil, validar o registo e terminar a sessão.
- Cada transação, categoria e orçamento pertence a um utilizador (`userId`); as páginas consultam e apresentam apenas os registos da conta autenticada.

## Aviso de segurança

Este projeto usa intencionalmente uma base de dados JSON simples e autenticação ilustrativa para fins académicos. A base de demonstração inclui credenciais de exemplo, e as palavras-passe de novas contas são enviadas à API simulada. **Não utilize credenciais reais nem dados financeiros sensíveis.** A sessão guardada no LocalStorage contém apenas o ID, o nome e o e-mail do utilizador — nunca a palavra-passe. O JSON Server não oferece autorização no servidor; esta demonstração não é adequada para produção.

## Verificações

```sh
npm run lint
npm run build
```
