# 🚀 Interview App - Testing Guide

## ✅ What's Running

| Service | URL | Status |
|---------|-----|--------|
| **Frontend (Next.js)** | http://localhost:3000 | ✅ Running |
| **Backend (Flask)** | http://127.0.0.1:5000 | ✅ Running |
| **Database (MySQL)** | interview_app_database | ✅ Connected |

---

## 🧪 How to Test

### Option 1: Browser Testing

1. **Open Frontend**: Navigate to `http://localhost:3000`
2. **Check Health**: Visit `http://127.0.0.1:5000/api/health`
3. **Test Features**:
   - Register a new user
   - Login with credentials
   - View candidates
   - View questions
   - Create/edit interviews

### Option 2: API Testing with Postman/Thunder Client

#### **Authentication**

**Register New User**
```
POST http://127.0.0.1:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Login**
```
POST http://127.0.0.1:5000/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

Response will include JWT token:
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

#### **Candidates** (requires token)

**Get All Candidates**
```
GET http://127.0.0.1:5000/api/candidates
Authorization: Bearer <your_token_here>
```

**Create Candidate**
```
POST http://127.0.0.1:5000/api/candidates
Authorization: Bearer <your_token_here>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "status": "pending"
}
```

**Update Candidate**
```
PUT http://127.0.0.1:5000/api/candidates/1
Authorization: Bearer <your_token_here>
Content-Type: application/json

{
  "status": "selected",
  "phone": "+9876543210"
}
```

**Delete Candidate**
```
DELETE http://127.0.0.1:5000/api/candidates/1
Authorization: Bearer <your_token_here>
```

#### **Questions** (requires token)

**Get All Questions**
```
GET http://127.0.0.1:5000/api/questions
```

**Create Question**
```
POST http://127.0.0.1:5000/api/questions
Authorization: Bearer <your_token_here>
Content-Type: application/json

{
  "title": "Explain async/await",
  "description": "How does async/await work in JavaScript?",
  "difficulty": "medium"
}
```

**Filter Questions**
```
GET http://127.0.0.1:5000/api/questions?difficulty=easy
GET http://127.0.0.1:5000/api/questions?difficulty=medium
GET http://127.0.0.1:5000/api/questions?difficulty=hard
```

#### **Interviews** (requires token)

**Get All Interviews**
```
GET http://127.0.0.1:5000/api/interviews
```

**Get Candidate Interviews**
```
GET http://127.0.0.1:5000/api/interviews/candidate/1
```

**Create Interview**
```
POST http://127.0.0.1:5000/api/interviews
Authorization: Bearer <your_token_here>
Content-Type: application/json

{
  "candidate_id": 1,
  "question_id": 1,
  "score": 85,
  "feedback": "Good performance"
}
```

**Update Interview**
```
PUT http://127.0.0.1:5000/api/interviews/1
Authorization: Bearer <your_token_here>
Content-Type: application/json

{
  "score": 90,
  "feedback": "Excellent performance"
}
```

**Delete Interview**
```
DELETE http://127.0.0.1:5000/api/interviews/1
Authorization: Bearer <your_token_here>
```

---

## 🔧 Frontend Integration

Your frontend can now make API calls using the integrated API functions:

```typescript
import { 
  login, 
  getCandidates, 
  getQuestions, 
  getInterviews,
  createInterview 
} from '@/lib/api';

// Login
const { token, user } = await login('testuser', 'password123');

// Get candidates
const { candidates } = await getCandidates();

// Get questions
const { questions } = await getQuestions('medium');

// Create interview
await createInterview(1, 1, 85, 'Great job!');
```

---

## 🛠️ Troubleshooting

### Frontend not connecting to backend?

1. **Check backend is running**: Visit `http://127.0.0.1:5000/api/health`
2. **Verify .env.local**: Should have `NEXT_PUBLIC_API_URL=http://127.0.0.1:5000`
3. **Check browser console**: For any CORS or network errors

### Backend errors?

1. **Check MySQL connection**: Verify database is running
2. **Check Python virtual environment**: `.\venv\Scripts\Activate.ps1`
3. **Review logs**: Check terminal output for error messages

### Port conflicts?

```powershell
# Kill process on specific port
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | `
  Select-Object -ExpandProperty OwningProcess | `
  Stop-Process -Force
```

---

## 🎯 Testing Checklist

- [ ] Frontend loads at http://localhost:3000
- [ ] Backend health check works
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can view candidates list
- [ ] Can create new candidate
- [ ] Can view questions list
- [ ] Can create new question
- [ ] Can view interviews
- [ ] Can create new interview
- [ ] JWT token persists in localStorage
- [ ] Protected routes redirect to login when not authenticated

---

## 📊 Data Flow

```
User (Browser)
    ↓
Next.js Frontend (localhost:3000)
    ↓
API Requests (HTTP)
    ↓
Flask Backend (127.0.0.1:5000)
    ↓
MySQL Database (interview_app_database)
    ↓
Response (JSON) → Frontend → Display to User
```

---

## 🚀 Next Steps

1. Test all API endpoints
2. Check frontend components render correctly
3. Verify authentication flow works
4. Test CRUD operations for all resources
5. Check error handling and validation
6. Review frontend styling and UX

Happy testing! 🎉
