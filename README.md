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

3. Run the server:
```bash
npm start
```

The server will initialize the database schema automatically on first run.

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

### Render
1. Create new Web Service on Render.com
2. Connect GitHub repository
3. Add environment variables from `.env`
4. Deploy

## Environment Variables

See `.env.example` for required variables.
