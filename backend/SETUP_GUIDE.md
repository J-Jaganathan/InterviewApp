# 🚀 Flask Backend - Complete Setup Guide

## ✅ What's Included

Your complete Flask backend codebase includes:

### Core Files
- **app.py** - Main Flask application with blueprint registration
- **config.py** - Configuration management (Dev, Prod, Test)
- **models.py** - SQLAlchemy models (User, Candidate, Question, Interview)
- **auth.py** - JWT authentication and decorators
- **utils.py** - Helper functions and utilities

### Route Files (API Endpoints)
- **routes_auth.py** - Authentication endpoints (register, login, logout)
- **routes_candidates.py** - Candidate CRUD operations
- **routes_questions.py** - Question CRUD operations
- **routes_interviews.py** - Interview tracking operations

### Configuration Files
- **.env** - Environment variables with your database credentials
- **requirements.txt** - Python dependencies
- **API_DOCUMENTATION.md** - Detailed API documentation
- **BACKEND_README.md** - Backend setup and usage guide

---

## 🔧 Step-by-Step Setup

### Step 1: Navigate to Backend Directory
```powershell
cd "c:\Users\2480328\OneDrive - Cognizant\Desktop\Project\Interview_App\backend"
```

### Step 2: Create Virtual Environment
```powershell
python -m venv venv
```

### Step 3: Activate Virtual Environment
```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1
```

If you get execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 4: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 5: Verify MySQL is Running
Make sure MySQL Server is installed and running on your system.

### Step 6: Create Database (if not exists)
```sql
CREATE DATABASE interview_app_database;
```

### Step 7: Run the Backend
```powershell
python app.py
```

✅ Backend will start at: **http://127.0.0.1:5000**

---

## 📋 Database Credentials (Already in .env)

```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=SQL@123PPa
MYSQL_DATABASE=interview_app_database
SECRET_KEY=supersecretkey
FLASK_ENV=development
```

---

## 🔌 Testing the Backend

### Health Check
```powershell
Invoke-WebRequest http://127.0.0.1:5000/api/health
```

### Register User
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Login
```powershell
$body = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

---

## 📚 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register` - Create new account
- `POST /login` - Login and get JWT token
- `GET /me` - Get current user (requires token)
- `POST /logout` - Logout (requires token)

### Candidates (`/api/candidates`)
- `GET /` - Get all candidates
- `GET /<id>` - Get specific candidate
- `POST /` - Create candidate
- `PUT /<id>` - Update candidate
- `DELETE /<id>` - Delete candidate
- `GET /search?q=<query>` - Search candidates

### Questions (`/api/questions`)
- `GET /` - Get all questions
- `GET /<id>` - Get specific question
- `POST /` - Create question
- `PUT /<id>` - Update question
- `DELETE /<id>` - Delete question

### Interviews (`/api/interviews`)
- `GET /` - Get all interviews
- `GET /<id>` - Get specific interview
- `GET /candidate/<candidate_id>` - Get candidate interviews
- `POST /` - Create interview
- `PUT /<id>` - Update interview
- `DELETE /<id>` - Delete interview

---

## 🔐 Authentication Flow

1. **Register** with username, email, and password
2. **Login** to get JWT token
3. **Use token** in Authorization header for protected endpoints:
   ```
   Authorization: Bearer <your_token_here>
   ```
4. Token expires in **24 hours**

---

## 🎯 Next Steps

### 1. Verify Backend Works
- Start the backend: `python app.py`
- Check health: Visit `http://127.0.0.1:5000/api/health`
- Create test data through API

### 2. Connect Frontend (Next.js)
- Frontend should use: `NEXT_PUBLIC_API_URL=http://127.0.0.1:5000`
- API calls will be made to backend endpoints
- JWT tokens will be stored in localStorage

### 3. Test API Endpoints
- Use Postman, Thunder Client, or cURL
- See **API_DOCUMENTATION.md** for detailed examples

### 4. Develop Frontend Components
- Create pages for login/register
- Display candidates, questions, and interview results
- All data comes from backend APIs

---

## 📦 Project Architecture

```
Interview App
    ↓
Frontend (Next.js) → Backend (Flask) → MySQL Database
    ↓
http://localhost:3000 → http://127.0.0.1:5000 → interview_app_database
```

**Data Flow:**
1. User interacts with Next.js frontend
2. Frontend sends API requests to Flask backend
3. Flask backend queries MySQL database
4. Response is returned as JSON to frontend
5. Frontend renders UI dynamically

---

## 🛠️ Common Commands

### Start Backend
```powershell
python app.py
```

### Install New Package
```powershell
pip install package_name
pip freeze > requirements.txt  # Update requirements
```

### Deactivate Virtual Environment
```powershell
deactivate
```

### Check Dependencies
```powershell
pip list
```

---

## ⚠️ Troubleshooting

### Port 5000 Already in Use
Edit `app.py` and change:
```python
app.run(debug=True, host='127.0.0.1', port=5001)
```

### MySQL Connection Error
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists: `interview_app_database`

### CORS Error with Frontend
- CORS is already configured for `http://localhost:3000`
- If frontend uses different URL, update in `app.py`:
```python
allow_origins=["http://your-frontend-url:port"]
```

### Virtual Environment Issues
```powershell
# Deactivate and remove
deactivate
rm -r venv

# Recreate
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## 📖 Additional Resources

- **API_DOCUMENTATION.md** - Complete API reference
- **BACKEND_README.md** - Detailed backend documentation
- **models.py** - Database schema
- **config.py** - Configuration options

---

## ✨ Features Implemented

✅ User authentication with JWT  
✅ Password hashing with bcrypt  
✅ CORS enabled for frontend  
✅ MySQL database integration  
✅ CRUD operations for all resources  
✅ Search and filter capabilities  
✅ Error handling and validation  
✅ Environment-based configuration  
✅ API documentation  

---

## 🎉 You're All Set!

Your complete Flask backend is ready to use. Start the server and begin building your interview management application!

For questions, refer to the documentation files or check the API endpoints with Postman.
