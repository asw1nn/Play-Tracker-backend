# Play Tracker Backend API

Backend service for the Play Tracker workout tracker application with user authentication and PostgreSQL database.

## Features

- User registration and authentication with JWT
- Secure workout data storage
- RESTful API endpoints
- PostgreSQL database with Aiven
- Ready for deployment to Railway/Render

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your PostgreSQL credentials
   - Set `JWT_SECRET` to a random value with at least 32 characters
   - Set `FRONTEND_URL` to the exact origin of the deployed frontend

3. Run the server:
```bash
npm start
```

The server will initialize the database schema automatically on first run.
The `/health` endpoint is available for hosting-provider health checks.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Workouts
- `POST /api/workouts` - Save workout (protected)
- `GET /api/workouts` - Get all workouts (protected)
- `GET /api/workouts/:id` - Get specific workout (protected)
- `DELETE /api/workouts/:id` - Delete workout (protected)
- `POST /api/workouts/migrate` - Migrate localStorage data (protected)

## Deployment

### Railway
1. Create new project on Railway.app
2. Connect GitHub repository
3. Add environment variables from `.env`
4. Deploy

### Render demo deployment
1. Create a Blueprint from this repository; Render reads `render.yaml` and configures the service.
2. Provide the requested Supabase database connection values and the frontend's Vercel URL when prompted. Render generates `JWT_SECRET`.
3. Deploy, then set `NEXT_PUBLIC_API_URL` in Vercel to `https://<render-service-host>/api` and redeploy the frontend.

## Environment Variables

See `.env.example` for required variables. Never commit `.env` or place production secrets in source control.
