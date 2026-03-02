# Interview App Backend API Documentation

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
```

Activate (Windows):
```bash
venv\Scripts\activate
```

Activate (Mac/Linux):
```bash
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Database

Ensure MySQL is running and update `.env` file with your database credentials:

```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=SQL@123PPa
MYSQL_DATABASE=interview_app_database
SECRET_KEY=supersecretkey
```

### 4. Run the Application

```bash
python app.py
```

Backend runs at: `http://127.0.0.1:5000`

---

## API Endpoints

### Authentication

#### Register
- **POST** `/api/auth/register`
- Body:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login
- **POST** `/api/auth/login`
- Body:
```json
{
  "username": "john_doe",
  "password": "password123"
}
```
- Response includes JWT token

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`

#### Logout
- **POST** `/api/auth/logout`
- Headers: `Authorization: Bearer <token>`

---

### Candidates

#### Get All Candidates
- **GET** `/api/candidates`

#### Get Candidate by ID
- **GET** `/api/candidates/<id>`

#### Create Candidate
- **POST** `/api/candidates`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "status": "pending"
}
```

#### Update Candidate
- **PUT** `/api/candidates/<id>`
- Headers: `Authorization: Bearer <token>`
- Body: Same as create (partial fields allowed)

#### Delete Candidate
- **DELETE** `/api/candidates/<id>`
- Headers: `Authorization: Bearer <token>`

#### Search Candidates
- **GET** `/api/candidates/search?q=<query>`

---

### Questions

#### Get All Questions
- **GET** `/api/questions`
- Query params: `difficulty`, `category` (optional)

#### Get Question by ID
- **GET** `/api/questions/<id>`

#### Create Question
- **POST** `/api/questions`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "title": "Explain async/await",
  "description": "Explain how async/await works in JavaScript",
  "difficulty": "medium",
  "category": "JavaScript"
}
```

#### Update Question
- **PUT** `/api/questions/<id>`
- Headers: `Authorization: Bearer <token>`
- Body: Same as create (partial fields allowed)

#### Delete Question
- **DELETE** `/api/questions/<id>`
- Headers: `Authorization: Bearer <token>`

---

### Interviews

#### Get All Interviews
- **GET** `/api/interviews`
- Query params: `candidate_id`, `status` (optional)

#### Get Interview by ID
- **GET** `/api/interviews/<id>`

#### Get Interviews by Candidate
- **GET** `/api/interviews/candidate/<candidate_id>`

#### Create Interview
- **POST** `/api/interviews`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "candidate_id": 1,
  "question_id": 1,
  "score": 85,
  "feedback": "Good performance",
  "status": "completed"
}
```

#### Update Interview
- **PUT** `/api/interviews/<id>`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "score": 90,
  "feedback": "Excellent",
  "status": "completed"
}
```

#### Delete Interview
- **DELETE** `/api/interviews/<id>`
- Headers: `Authorization: Bearer <token>`

---

## Health Check

- **GET** `/api/health`

Returns:
```json
{
  "status": "healthy",
  "message": "Interview App Backend is running"
}
```

---

## Database Schema

### Users Table
- `id` (INT, Primary Key)
- `username` (VARCHAR, Unique)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `role` (VARCHAR)
- `created_at` (TIMESTAMP)

### Candidates Table
- `id` (INT, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `status` (VARCHAR)
- `created_at` (TIMESTAMP)

### Questions Table
- `id` (INT, Primary Key)
- `title` (VARCHAR)
- `description` (TEXT)
- `difficulty` (VARCHAR)
- `category` (VARCHAR)
- `created_at` (TIMESTAMP)

### Interviews Table
- `id` (INT, Primary Key)
- `candidate_id` (INT, Foreign Key)
- `question_id` (INT, Foreign Key)
- `user_id` (INT, Foreign Key)
- `score` (INT)
- `feedback` (TEXT)
- `status` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Tokens expire in 24 hours (86400 seconds).

---

## CORS Configuration

Allowed origins:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

Allowed methods: GET, POST, PUT, DELETE, OPTIONS

---

## Error Handling

All errors return JSON with appropriate HTTP status codes:

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., duplicate username)
- `500` - Internal Server Error

---

## Notes

- Passwords are hashed using bcrypt
- Database uses PyMySQL for MySQL connection
- SQLAlchemy ORM for database operations
- CORS enabled for Next.js frontend communication
