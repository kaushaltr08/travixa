# Travixa

Travixa is a travel intelligence platform for discovering and planning India trips by vibe, budget, season, duration, partner, and travel style.

## Apps

- `frontend` - public Next.js app with landing, explore, studio, generated trip, destination detail, and user dashboard pages.
- `admin` - Next.js admin dashboard for destinations, experiences, travel styles, users, trip requests, and settings.
- `server` - Express, MongoDB, Mongoose, JWT, and role-ready API.

## Environment

Copy the example files and update values:

```bash
cp server/config.env.example server/config.env
cp frontend/.env.local.example frontend/.env.local
cp admin/.env.local.example admin/.env.local
```

## Install

```bash
cd server && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

## Run

Start MongoDB, then run each app in a separate terminal:

```bash
cd server && npm run dev
cd frontend && npm run dev
cd admin && npm run dev
```

Seed sample destinations, travel styles, and experiences:

```bash
cd server && npm run seed:destinations
```

Default URLs:

- Frontend: `http://localhost:3000`
- Admin: `http://localhost:3000` or the next available Next.js port
- API: `http://localhost:5000`

## API

- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Destinations: `GET|POST /api/destinations`, `GET|PUT|DELETE /api/destinations/:id`
- Experiences: `GET|POST /api/experiences`, `GET|PUT|DELETE /api/experiences/:id`
- Travel Styles: `GET|POST /api/travel-styles`, `GET|PUT|DELETE /api/travel-styles/:id`
- Trip Requests: `GET|POST /api/trip-requests`, `GET|PUT|DELETE /api/trip-requests/:id`
- Generated Trips: `GET|POST /api/generated-trips`, `GET|PUT|DELETE /api/generated-trips/:id`
