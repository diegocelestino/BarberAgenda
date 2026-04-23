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

### Barbers
- `GET /barbers` - Get all barbers
- `GET /barbers/:barberId` - Get single barber
- `GET /barbers/:barberId/available-slots?date=YYYY-MM-DD&duration=30` - Get available time slots
- `GET /barbers/:barberId/extract?startDate=TIMESTAMP&endDate=TIMESTAMP&format=json|pdf` - Get appointment extract/report
- `POST /barbers` - Create new barber
- `PUT /barbers/:barberId` - Update barber
- `DELETE /barbers/:barberId` - Delete barber

### Appointments
- `GET /barbers/:barberId/appointments` - Get appointments for a barber
- `POST /barbers/:barberId/appointments` - Create appointment
- `PUT /barbers/:barberId/appointments/:appointmentId` - Update appointment
- `DELETE /barbers/:barberId/appointments/:appointmentId` - Delete appointment

### Services
- `GET /services` - Get all services
- `POST /services` - Create service
- `PUT /services/:serviceId` - Update service
- `DELETE /services/:serviceId` - Delete service

### Auth
- `POST /auth/login` - Login (mock authentication)

## Usage with Frontend

Update your frontend `.env` file:

```
REACT_APP_API_URL=http://localhost:3001
```
