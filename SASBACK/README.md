# SAS2 Fitness Platform Backend

This is the backend API for the SAS2 Fitness Platform, a SaaS fitness application that uses DeepSeek AI to manage user information through natural language requests.

## Features

- User authentication and profile management
- AI-powered workout plan generation
- AI-powered nutrition plan generation
- Progress tracking
- Natural language processing for user requests
- Intent recognition and handling

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Users
- `GET /api/users/:id/profile` - Get user profile
- `PUT /api/users/:id/profile` - Update user profile
- `GET /api/users/:id/goals` - Get user goals
- `POST /api/users/:id/goals` - Create a new goal
- `PUT /api/users/:id/goals/:goalId` - Update a goal
- `GET /api/users/:id/progress` - Get user progress
- `POST /api/users/:id/progress` - Add a progress entry

### Workouts
- `GET /api/workouts/plans` - Get workout plans
- `GET /api/workouts/plans/:id` - Get a specific workout plan
- `POST /api/workouts/plans` - Create a workout plan
- `PUT /api/workouts/plans/:id` - Update a workout plan
- `DELETE /api/workouts/plans/:id` - Delete a workout plan
- `GET /api/workouts/logs` - Get workout logs
- `POST /api/workouts/logs` - Log a workout

### Nutrition
- `GET /api/nutrition/plans` - Get nutrition plans
- `GET /api/nutrition/plans/:id` - Get a specific nutrition plan
- `POST /api/nutrition/plans` - Create a nutrition plan
- `PUT /api/nutrition/plans/:id` - Update a nutrition plan
- `DELETE /api/nutrition/plans/:id` - Delete a nutrition plan

### AI
- `POST /api/ai/generate-workout` - Generate a workout plan
- `POST /api/ai/generate-nutrition` - Generate a nutrition plan
- `POST /api/ai/advice` - Get fitness advice (legacy endpoint)
- `POST /api/ai/chat` - Process a chat message and handle intent

## Intent Recognition System

The backend includes an intent recognition system that can identify the user's intent from natural language messages. The system supports the following intents:

- `create_workout` - Create a new workout plan
- `update_workout` - Update an existing workout plan
- `create_nutrition` - Create a new nutrition plan
- `update_nutrition` - Update an existing nutrition plan
- `log_progress` - Log progress (weight, body fat, etc.)
- `get_progress` - Get progress information
- `get_workout_info` - Get information about workout plans
- `get_nutrition_info` - Get information about nutrition plans
- `get_exercise_info` - Get information about exercises
- `general_advice` - Get general fitness advice

## Setup

1. Create a MySQL database named `sas2`
2. Run the SQL script in `database.sql` to create the necessary tables
3. Install dependencies: `npm install`
4. Create a `.env` file with the following content:

```
PORT=5000
NODE_ENV=development

# Database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sas2

# JWT Secret
JWT_SECRET=your_secret_key

# Deepseek API
DEEPSEEK_API_KEY=your_deepseek_api_key
```

5. Start the server: `npm run dev`

## Logging

The application includes a comprehensive logging system that logs:

- HTTP requests and responses
- AI interactions
- Intent recognition
- Error handling

Logs are stored in the `logs` directory:
- `access.log` - HTTP requests
- `error.log` - Errors and warnings
- `debug.log` - Debug information (only in development mode)
