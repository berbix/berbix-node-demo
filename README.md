# berbix-node-demo

This is an example/demo app showing the use of the berbix-node library.  It is intended for demonstration purposes only and _should not_ be used in production.  This code is released as-is.

# Set Up

## Set up Postgres

- `brew install postgresql`
- `brew services start postgresql`
- `psql postgres`
- `CREATE ROLE ADMIN WITH PASSWORD 'password';`
- `ALTER ROLE ADMIN CREATEDB;`
- `ALTER ROLE ADMIN with LOGIN;`
- exit psql shell (ctrl-d)
- ` psql -d postgres -U admin`
- `CREATE DATABASE demo_integration;`

## Set up Server

- `npm i`
- `npm run start:dev`

## Set up Client

- `npm i`
- `npm run start`
