
# Drip Store API

API RESTful desenvolvida como projeto de Back-end do curso Digital College, utilizando Node.js, Express, MySQL e Sequelize.

## Tecnologias

- Node.js
- Express
- MySQL
- Sequelize
- JWT (JSON Web Token)
- Bcrypt
- Jest
- Supertest

## Requisitos

- Node.js instalado
- MySQL instalado e em execução
- npm

## Instalação

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd drip-store-api
```

Instale as dependências:

```bash
npm install
```

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto, seguindo o modelo `.env.example`.

Configure suas variáveis:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=drip_store
DB_USER=root
DB_PASSWORD=sua_senha

JWT_SECRET=sua_chave_secreta
```

Crie o banco de dados `drip_store` no MySQL antes de iniciar a aplicação.

**Importante:** nunca publique o arquivo `.env` ou suas credenciais.

## Executando a aplicação

Modo desenvolvimento:

```bash
npm run dev
```

Modo produção:

```bash
npm start
```

A API estará disponível em:

```text
http://localhost:3000
```

## Autenticação

As rotas protegidas utilizam JWT.

Para autenticar:

```http
POST /v1/user/token
```

Exemplo de corpo:

```json
{
  "email": "usuario@email.com",
  "password": "senha"
}
```

Utilize o token retornado no cabeçalho das rotas protegidas:

```http
Authorization: Bearer SEU_TOKEN
```

## Endpoints

### Usuários

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/v1/user` | Criar usuário |
| GET | `/v1/user/:id` | Consultar usuário |
| PUT | `/v1/user/:id` | Atualizar usuário |
| DELETE | `/v1/user/:id` | Excluir usuário |
| POST | `/v1/user/token` | Autenticar usuário |

### Categorias

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/v1/category/search` | Listar categorias |
| GET | `/v1/category/:id` | Consultar categoria |
| POST | `/v1/category` | Criar categoria |
| PUT | `/v1/category/:id` | Atualizar categoria |
| DELETE | `/v1/category/:id` | Excluir categoria |

### Produtos

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/v1/product/search` | Listar produtos |
| GET | `/v1/product/:id` | Consultar produto |
| POST | `/v1/product` | Criar produto |
| PUT | `/v1/product/:id` | Atualizar produto |
| DELETE | `/v1/product/:id` | Excluir produto |

As operações de criação, atualização e exclusão exigem autenticação JWT.

## Filtros de busca

### Categorias

A busca permite utilizar:

- `limit`: quantidade de registros.
- `page`: página.
- `fields`: campos retornados.
- `use_in_menu`: filtrar categorias exibidas no menu.

Exemplo:

```text
/v1/category/search?limit=10&page=1&use_in_menu=true
```

### Produtos

A busca permite utilizar:

- `limit`: quantidade de registros.
- `page`: página.
- `fields`: campos retornados.
- `match`: busca pelo nome.
- `category_ids`: filtro por categorias.
- `price-range`: intervalo de preços.
- `option[n]`: filtro por opção do produto.

Exemplo:

```text
/v1/product/search?limit=10&page=1&match=tenis
```

## Testes automatizados

Execute:

```bash
npm test
```

Os testes são desenvolvidos com Jest e Supertest.

## Estrutura do projeto

```text
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── app.js
└── server.js

tests/
migrations/
docs/
```

## Autor

Desenvolvido como projeto acadêmico de Back-end — Digital College.
