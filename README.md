# berbix-node-demo

## Introduction
Integrating with Berbix is easy!  This guide will have you up & running in no time.  This guide assumes you have `node.js` installed in your local development environment.

## Disclaimer
This code is just a demo to show you how to get started with a Berbix integration using the [berbix-node](https://github.com/berbix/berbix-node) library..  It is not intended to be used in production.

# Set Up

## Berbix Quick Start Guide
- [ ] Start by cloning this repo:
```
git clone git@github.com:berbix/berbix-node-demo.git
```

- [ ] Login to the Berbix console: https://dashboard.berbix.com/login

- [ ] Enable "Test" mode with the slider in the top right hand corner of the Berbix Dashboard.

- [ ] Generate API keys following these instructions: https://docs.berbix.com/docs/settings#section-api-keys

- [ ] Copy `server/.env.example` to `server/.env` and add your API secret to `BERBIX_API_SECRET`

- [ ] Whitelist the development domain for this app.  Go to Settings (the gear icon in the top right corner of the Berbix Dashboard) —> Domains —> Add Domain —> “http://localhost:3000”

- [ ] Copy your template key from the "Templates" tab in the Berbix Dashboard into the `.env` file.

- [ ] Add your last name (as on your ID that you'll be testing with) to your list of Test IDs.  Go to Settings —> Test IDs -> Add Test ID.

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

```
$ cd server
$ npm i
$ npm run start:dev
```

## Set up Client

```
$ cd client 
$ npm i
$ npm run start
```