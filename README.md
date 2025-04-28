# Futurous

A full-stack application for scheduling time-locked messages, built with React (Vite), Express, Node.js, and PostgreSQL. Messages can be created, updated, and deleted within a specific time window, after which they become locked until delivery.

## Features

- **User Authentication:**
  - Secure signup and login with JWT tokens
  - Protected routes for authenticated users
  - Email and password-based authentication

- **Message Management:**
  - Schedule messages for future delivery
  - Update messages before they are locked
  - Delete messages before they are locked
  - Automatic message locking after 10% of delivery time has passed
  - Real-time countdown for message delivery and locking

- **Security Features:**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Protected API endpoints
  - Environment variable configuration

## Tech Stack

- **Frontend:**
  - React 18 with Vite
  - Tailwind CSS for styling
  - React Router for navigation
  - Axios for API calls
  - React Toastify for notifications

- **Backend:**
  - Node.js & Express
  - PostgreSQL for database
  - JWT for authentication
  - bcrypt for password hashing

- **DevOps:**
  - Docker and Docker Compose
  - Environment configuration
  - Database migrations

## Project Structure

```
futurous-postgres/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Context configurations
│   │   └── App.jsx         # Main application component
│   ├── .env               # Frontend environment variables
│   └── Dockerfile         # Frontend Docker configuration
│
├── backend/                  # Express backend application
│   ├── controllers/        # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── config/           # Configuration files
│   ├── .env             # Backend environment variables
│   └── Dockerfile       # Backend Docker configuration
│
└── docker-compose.yml      # Docker compose configuration
```

## Setup and Installation

1. Clone the repository:
```bash
git clone [<repository-url>](https://github.com/abhivansh31/futurous)
cd futurous-postgres
```

2. Configure environment variables:

Create `.env` in backend:
```properties
PORT=3001
PG_PORT=5432
PG_PASSWORD=your_password
JWT_SECRET=your_secret_key
DATABASE_URL=postgres://postgres:password@postgres:5432/futurous
```

Create `.env` in frontend:
```properties
VITE_API_URL=http://localhost:3001
```

3. Run with Docker Compose:
```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## API Endpoints

- **Authentication:**
  - POST `/api/auth/signup` - Register new user
  - POST `/api/auth` - Login user

- **Messages:**
  - POST `/api/messages/create` - Create new message
  - GET `/api/messages` - Get all user messages
  - PUT `/api/messages/:id` - Update message
  - DELETE `/api/messages/:id` - Delete message

## Message Lifecycle

1. **Creation:** Messages are created with content and delivery time
2. **Lock Period:** Messages become locked after 10% of time until delivery
3. **Delivery:** Messages are marked as delivered at scheduled time
4. **Post-Delivery:** Messages cannot be modified after delivery

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are required for protected routes
- Environment variables for sensitive data
- CORS configuration for API security

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for your own purposes.

