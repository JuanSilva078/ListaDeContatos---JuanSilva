# Gerenciamento de Contatos

Aplicação web de página única (SPA) para gerenciar uma agenda de contatos, desenvolvida como atividade prática da disciplina de Desenvolvimento de Aplicação em Nuvem.

## Integrantes

| Nome | GitHub |
|------|--------|
| Juan Pablo Mescouto da Silva | [@JuanSilva078](https://github.com/JuanSilva078) |

## Banco de Dados

**Google Firebase — Cloud Firestore (NoSQL)**

Coleção utilizada: `/contatos/{contatoId}`

Campos de cada documento:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | String | Nome completo do contato |
| `email` | String | Endereço de e-mail |
| `telefone` | String | Número de telefone |
| `dtContato` | String (ISO date) | Data de aniversário |

## Tecnologias

- HTML5
- CSS3 (vanilla)
- JavaScript (Vanilla JS / ES Modules)
- Firebase SDK v11 (via CDN)

## Funcionalidades (CRUD)

- **Create** — Cadastrar novo contato pelo formulário
- **Read** — Listagem em tempo real via `onSnapshot`
- **Update** — Editar contato existente (botão ✏️)
- **Delete** — Excluir contato com confirmação (botão 🗑️)
- **Busca** — Filtrar contatos por nome

## Como configurar o Firebase

1. Acesse [https://console.firebase.google.com](https://console.firebase.google.com) e crie um projeto.
2. Adicione um app Web ao projeto e copie as credenciais geradas.
3. Abra o arquivo `index.html` e substitua os valores de `firebaseConfig` pelas suas credenciais.
4. No Firestore, crie a coleção `contatos`.
5. Configure as **Security Rules** do Firestore para permitir leitura e escrita apenas do seu domínio (não deixe em modo público permanente).

## Deploy

Aplicação publicada via [Vercel](https://vercel.com).
