# Flask Backend - Interview App

A comprehensive Flask backend for the Interview Management Application.

## 📋 Features

- **User Authentication** - Register, login, and JWT-based authentication
- **Candidate Management** - Create, read, update, delete candidates
- **Question Management** - Manage interview questions by difficulty and category
- **Interview Tracking** - Track interview results and feedback
- **CORS Support** - Enabled for Next.js frontend communication
- **Database** - MySQL with SQLAlchemy ORM
- **Security** - Password hashing with bcrypt, JWT tokens

## 🗂️ Project Structure

```
backend/
├── app.py                    # Main Flask application
├── config.py                 # Configuration settings
├── models.py                 # Database models
├── auth.py                   # Authentication logic
├── routes_auth.py            # Authentication routes
├── routes_candidates.py       # Candidate routes
├── routes_questions.py        # Question routes
├── routes_interviews.py       # Interview routes
├── utils.py                  # Helper functions
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables
├── API_DOCUMENTATION.md      # API documentation
└── README.md                 # This file
```

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.8+
- MySQL Server running
- pip (Python package manager)

### 2. Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

Update `.env` with your MySQL credentials:

```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=SQL@123PPa
MYSQL_DATABASE=interview_app_database
SECRET_KEY=supersecretkey
FLASK_ENV=development
```

### 4. Run the Application

```bash
python app.py
```

Server will start at: `http://127.0.0.1:5000`

## 🔌 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=SQL@123PPa
MYSQL_DATABASE=interview_app_database

# Application
SECRET_KEY=your_secret_key_here
FLASK_ENV=development
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)

### Candidates
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/<id>` - Get specific candidate
- `POST /api/candidates` - Create candidate (requires auth)
- `PUT /api/candidates/<id>` - Update candidate (requires auth)
- `DELETE /api/candidates/<id>` - Delete candidate (requires auth)
- `GET /api/candidates/search?q=<query>` - Search candidates

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/<id>` - Get specific question
- `POST /api/questions` - Create question (requires auth)
- `PUT /api/questions/<id>` - Update question (requires auth)
- `DELETE /api/questions/<id>` - Delete question (requires auth)

### Interviews
- `GET /api/interviews` - Get all interviews
- `GET /api/interviews/<id>` - Get specific interview
- `GET /api/interviews/candidate/<candidate_id>` - Get candidate interviews
- `POST /api/interviews` - Create interview (requires auth)
- `PUT /api/interviews/<id>` - Update interview (requires auth)
- `DELETE /api/interviews/<id>` - Delete interview (requires auth)

### Health Check
- `GET /api/health` - Health check endpoint

## 🔐 Authentication

### Registration Example

```bash
curl -X POST http://127.0.0.1:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login Example

```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

Response includes JWT token:

```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Using Token in Requests

Include the token in the Authorization header:

```bash
curl -X GET http://127.0.0.1:5000/api/candidates \
  -H "Authorization: Bearer <your_token_here>"
```

## 🗄️ Database Models

### User
```python
- id: Integer (Primary Key)
- username: String (Unique)
- email: String (Unique)
- password: String (Hashed)
- role: String (Default: 'user')
- created_at: DateTime
```

### Candidate
```python
- id: Integer (Primary Key)
- name: String
- email: String
- phone: String
- status: String (Default: 'pending')
- created_at: DateTime
```

### Question
```python
- id: Integer (Primary Key)
- title: String
- description: Text
- difficulty: String (Default: 'medium')
- category: String
- created_at: DateTime
```

### Interview
```python
- id: Integer (Primary Key)
- candidate_id: Integer (Foreign Key)
- question_id: Integer (Foreign Key)
- user_id: Integer (Foreign Key)
- score: Integer
- feedback: Text
- status: String
- created_at: DateTime
- updated_at: DateTime
```

## 🛠️ Development

### Run in Debug Mode

```bash
FLASK_ENV=development python app.py
```

### Database Migrations

For production, consider using Flask-Migrate:

```bash
pip install Flask-Migrate
```

Then initialize migrations:

```bash
flask db init
flask db migrate
flask db upgrade
```

## 📦 Dependencies

- `Flask` - Web framework
- `Flask-CORS` - CORS support
- `Flask-SQLAlchemy` - ORM
- `PyMySQL` - MySQL driver
- `python-dotenv` - Environment variables
- `PyJWT` - JWT authentication
- `bcrypt` - Password hashing

## ⚠️ Common Issues

### Database Connection Error
- Ensure MySQL is running
- Verify credentials in `.env`
- Check database exists

### CORS Error
- CORS is pre-configured for localhost:3000
- Modify CORS settings in `app.py` for other origins

### Port Already in Use
- Change port in `app.py`: `app.run(port=5001)`

## 🔄 Integration with Next.js Frontend

Frontend should use:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

Example API call in Next.js:

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/candidates`
);
const data = await response.json();
```

## 🧪 Testing

Use tools like:
- **Postman** - API testing
- **Thunder Client** - VS Code extension
- **cURL** - Command line testing

## 📝 Logging

Add logging to `app.py`:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🚀 Production Deployment

- Use a production WSGI server (Gunicorn, uWSGI)
- Enable HTTPS
- Use environment-specific config
- Set up database backups
- Enable logging and monitoring

Example with Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📄 License

This project is part of the Interview App full-stack application.

## 👨‍💻 Support

For issues or questions, refer to the API documentation or check the main project README.
