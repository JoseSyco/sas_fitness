# SAS2 Fitness Platform

A SaaS fitness platform with AI-powered workout and nutrition plans using Deepseek API.

## Project Structure

- **SASBACK**: Backend API built with Node.js, Express, and PostgreSQL
- **SASFRONT**: Frontend application built with React, TypeScript, and Material-UI

## Setup Instructions

### Database Setup

1. Create a PostgreSQL database named `sas2`:

```sql
CREATE DATABASE sas2;
```

2. Run the SQL script in `SASBACK/database.sql` to create the necessary tables.

### Backend Setup

1. Navigate to the backend directory:

```bash
cd SASBACK
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following content (modify as needed):

```
PORT=5000
NODE_ENV=development

# Database configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=sas2
DB_PASSWORD=postgres
DB_PORT=5432

# JWT Secret
JWT_SECRET=sas2_secret_key_change_in_production

# Deepseek API
DEEPSEEK_API_KEY=your_deepseek_api_key
```

4. Start the backend server:

```bash
npm run dev
```

The server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd SASFRONT
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Features

- User authentication (register, login)
- User profile management
- AI-generated workout plans
- AI-generated nutrition plans
- Progress tracking
- Workout logging

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/goals` - Get user fitness goals
- `POST /api/users/goals` - Create a new fitness goal
- `PUT /api/users/goals/:goalId` - Update a fitness goal
- `POST /api/users/progress` - Track progress
- `GET /api/users/progress` - Get progress history

### Workouts
- `GET /api/workouts/plans` - Get all workout plans
- `GET /api/workouts/plans/:planId` - Get a specific workout plan
- `POST /api/workouts/plans` - Create a new workout plan
- `POST /api/workouts/logs` - Log a completed workout
- `GET /api/workouts/logs` - Get workout logs
- `GET /api/workouts/exercises` - Get all exercises

### Nutrition
- `GET /api/nutrition/plans` - Get all nutrition plans
- `GET /api/nutrition/plans/:planId` - Get a specific nutrition plan
- `POST /api/nutrition/plans` - Create a new nutrition plan
- `PUT /api/nutrition/plans/:planId` - Update a nutrition plan

### AI
- `POST /api/ai/generate-workout` - Generate a workout plan
- `POST /api/ai/generate-nutrition` - Generate a nutrition plan
- `POST /api/ai/advice` - Get fitness advice

## Technologies Used

### Backend
- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt for password hashing
- Deepseek API for AI-powered recommendations

### Frontend
- React
- TypeScript
- Material-UI
- React Router
- Axios for API calls
