# Barbershop Mock Server

Local development server for testing the barbershop application without AWS infrastructure.

## Setup

```bash
cd mock-server
npm install
```

## Running

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:3001`

## Endpoints

- `GET /barbers` - Get all barbers
- `GET /barbers/:barberId` - Get single barber
- `POST /barbers` - Create new barber
- `PUT /barbers/:barberId` - Update barber
- `DELETE /barbers/:barberId` - Delete barber

## Usage with Frontend

Update your frontend `.env` file:

```
REACT_APP_API_URL=http://localhost:3001
```
