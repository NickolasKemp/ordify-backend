## Run With Docker

```bash
  docker compose up
```

## Run Locally

Clone the project

```bash
  git clone https://github.com/NickolasKemp/ordify-backend.git
```

Install dependencies

```bash
  pnpm install
```

Up mongo database, then create and configure .env file 

```bash
PORT=3005
FRONTEND_URL=http://localhost:4200
DB_URL=... # add database url
JWT_REFRESH_SECRET=ordify-refresh-secret
JWT_ACCESS_SECRET=ordify-access-secret
BACKEND_URL=http://localhost:3005
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=kemplent.auth@gmail.com 
SMTP_PASS=cebxzyutgsxgnqiz
ADMIN_EMAIL=ordify.auth@gmail.com

```

Start the backend server

```bash
  npm run start:dev
```
