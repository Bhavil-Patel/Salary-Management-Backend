
# Basic Node.js Backend

A REST API backend built with Node.js, Express.js, MySQL2, Sequelize, Yarn, Nodemon, and dotenv.

## Tech Stack

- Node.js & Express.js
- MySQL & MySQL2
- Sequelize & Sequelize CLI
- Yarn
- Nodemon
- dotenv

## Project Structure

```text
basic-backend/
├── config/
│   └── db.js
├── models/
│   └── User.js
├── migrations/
├── src/
│   ├── controllers/
│   ├── routes/
│   └── server.js
├── .env
├── .sequelizerc
├── .gitignore
├── package.json
├── README.md
└── yarn.lock
```

## Installation

```bash
yarn install
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=basic_backend
DB_DIALECT=mysql
```

## Database Setup

Create the MySQL database:

```sql
CREATE DATABASE basic_backend;
```

## Run the Application

Development mode:

```bash
yarn dev
```

Normal mode:

```bash
yarn start
```

## Database Migrations

Create a migration:

```bash
yarn db:migration:create create-users
```

Run migrations:

```bash
yarn db:migrate
```

Undo the latest migration:

```bash
yarn db:migrate:undo
```

Check migration status:

```bash
yarn db:migrate:status
```

## Notes

- Database configuration and models are maintained outside `src`.
- Define models in the `models/` directory.
- Use migrations to create tables and modify columns.
- Keep database credentials in `.env` and never commit this file.
- API documentation will be added as endpoints are implemented.