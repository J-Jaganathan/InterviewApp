# Interview App – Full Stack Application

A full-stack Interview Management Application built with:

* **Frontend:** Next.js (React)
* **Backend:** Python (FastAPI)
* **Database:** MySQL
* **Architecture:** REST API based dynamic rendering (No hardcoded frontend data)

---

# 🚀 Project Overview

This application allows:

* User authentication (Login/Register)
* Managing interview questions
* Managing candidates
* Tracking interview results
* Rendering all frontend pages dynamically from database
* Secure backend API integration

All frontend data is fetched from backend APIs instead of static mock files.

---

# 🏗️ Project Architecture

```
Frontend (Next.js)
        ↓
REST API (FastAPI)
        ↓
MySQL Database
```

---

# 🗂️ Folder Structure

## Backend

```
backend/
│
├── main.py
├── database.py
├── models.py
├── schemas.py
├── crud.py
├── requirements.txt
└── .env
```

## Frontend

```
src/
├── app/
├── components/
├── services/api.ts
└── pages/
```

---

# 🛠️ Tech Stack

* Frontend: Next.js 14
* Backend: FastAPI
* ORM: SQLAlchemy
* Database: MySQL
* Auth: JWT
* API Client: Axios / Fetch

---

# 🧠 Database Configuration

The backend uses the following database configuration:

```python
DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "SQL@123PPa"),
    "database": os.getenv("MYSQL_DATABASE", "interview_app_database"),
    "autocommit": False,
}
```

---

# 🗄️ Database Setup

## 1️⃣ Install MySQL

Download and install MySQL from:

* [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/)

## 2️⃣ Create Database

```sql
CREATE DATABASE interview_app_database;
```

## 3️⃣ Create Tables

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    difficulty VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT,
    question_id INT,
    score INT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

---

# 🔧 Backend Setup (FastAPI)

## 1️⃣ Create Virtual Environment

```bash
python -m venv venv
```

Activate:

Windows:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
source venv/bin/activate
```

---

## 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

Example `requirements.txt`:

```
fastapi
uvicorn
sqlalchemy
pymysql
python-dotenv
passlib[bcrypt]
python-jose
```

---

## 3️⃣ Create .env File

```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=SQL@123PPa
MYSQL_DATABASE=interview_app_database
SECRET_KEY=supersecretkey
```

---

## 4️⃣ Run Backend Server

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

Swagger Docs:

```
http://127.0.0.1:8000/docs
```

---

# 🎨 Frontend Setup (Next.js)

## 1️⃣ Install Dependencies

```bash
npm install
```

## 2️⃣ Setup Environment

Create `.env.local`

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## 3️⃣ Run Frontend

```bash
npm run dev
```

Runs at:

```
http://localhost:3000
```

---

# 🔄 API Integration Pattern

All frontend pages use dynamic fetching:

Example:

```ts
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/candidates`
);
const data = await response.json();
```

No static mock data is used.

---

# 🔐 Authentication Flow

1. User registers
2. Password hashed using bcrypt
3. JWT token generated on login
4. Token stored in localStorage
5. Protected routes verify token via middleware

---

# 🧪 Testing APIs

Use:

* Swagger UI (`/docs`)
* Postman
* Thunder Client (VS Code)

---

# ⚠️ Common Issues

## Database Connection Error

Check:

* MySQL running
* Credentials correct
* Database exists

## CORS Error

Ensure FastAPI has:

```python
from fastapi.middleware.cors import CORSMiddleware
```

And:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

# 📈 Future Improvements

* Role-based access control
* Interview analytics dashboard
* Pagination
* Search filters
* Docker deployment
* CI/CD pipeline
* Unit & integration testing
* Production environment config

---

# 🐳 Docker (Optional Deployment)

Create Dockerfile for backend and frontend.

Use docker-compose to manage:

* MySQL
* Backend
* Frontend

---

# 📌 Production Checklist

* Use strong SECRET_KEY
* Use environment variables securely
* Enable HTTPS
* Use proper CORS origins
* Turn off debug mode
* Enable database pooling
* Add logging & monitoring

---

# 🧩 How Everything Works Together

1. Frontend calls REST API.
2. Backend validates request.
3. Backend interacts with MySQL.
4. JSON response returned.
5. Frontend renders UI dynamically.

---

# 👨‍💻 Author

Built as a full-stack dynamic Interview Management System.