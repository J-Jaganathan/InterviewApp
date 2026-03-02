# 🧪 Quick Manual Testing Steps

## ✅ Before You Start

- ✅ Backend running on http://127.0.0.1:5000
- ✅ Frontend running on http://localhost:3000
- ✅ MySQL database is active

---

## 📋 Test Scenario 1: User Registration & Login

### Step 1: Register User
```
Open Postman/Thunder Client

POST http://127.0.0.1:5000/api/auth/register

Body (JSON):
{
  "username": "testuser123",
  "email": "testuser@example.com",
  "password": "TestPassword123"
}
```

**Expected Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "testuser123",
    "email": "testuser@example.com",
    "role": "user",
    "created_at": "2026-03-02T10:30:00"
  }
}
```

### Step 2: Login User
```
POST http://127.0.0.1:5000/api/auth/login

Body (JSON):
{
  "username": "testuser123",
  "password": "TestPassword123"
}
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "testuser123",
    "email": "testuser@example.com",
    "role": "user",
    "created_at": "2026-03-02T10:30:00"
  }
}
```

**📌 Copy the token for use in other requests**

---

## 📋 Test Scenario 2: Candidate Management

### Step 3: Create Candidate
```
POST http://127.0.0.1:5000/api/candidates

Headers:
- Content-Type: application/json
- Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

Body (JSON):
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "status": "pending"
}
```

**Expected Response:**
```json
{
  "message": "Candidate created successfully",
  "candidate": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1234567890",
    "status": "pending",
    "created_at": "2026-03-02T10:35:00"
  }
}
```

### Step 4: Get All Candidates
```
GET http://127.0.0.1:5000/api/candidates

Headers:
- Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Expected Response:**
```json
{
  "candidates": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+1234567890",
      "status": "pending",
      "created_at": "2026-03-02T10:35:00"
    }
  ],
  "total": 1
}
```

### Step 5: Update Candidate
```
PUT http://127.0.0.1:5000/api/candidates/1

Headers:
- Content-Type: application/json
- Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

Body (JSON):
{
  "status": "selected",
  "phone": "+9876543210"
}
```

### Step 6: Search Candidate
```
GET http://127.0.0.1:5000/api/candidates/search?q=Alice
```

---

## 📋 Test Scenario 3: Question Management

### Step 7: Create Question
```
POST http://127.0.0.1:5000/api/questions

Headers:
- Content-Type: application/json
- Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

Body (JSON):
{
  "title": "What is React?",
  "description": "Explain React and its core concepts",
  "difficulty": "easy"
}
```

### Step 8: Get All Questions
```
GET http://127.0.0.1:5000/api/questions

No authentication required
```

### Step 9: Filter Questions by Difficulty
```
GET http://127.0.0.1:5000/api/questions?difficulty=easy
GET http://127.0.0.1:5000/api/questions?difficulty=medium
GET http://127.0.0.1:5000/api/questions?difficulty=hard
```

### Step 10: Create More Questions
```
POST http://127.0.0.1:5000/api/questions

Body examples:
{
  "title": "Explain async/await",
  "description": "How does async/await work?",
  "difficulty": "medium"
}

{
  "title": "Design a system",
  "description": "Design a scalable web service",
  "difficulty": "hard"
}
```

---

## 📋 Test Scenario 4: Interview Management

### Step 11: Create Interview
```
POST http://127.0.0.1:5000/api/interviews

Headers:
- Content-Type: application/json
- Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

Body (JSON):
{
  "candidate_id": 1,
  "question_id": 1,
  "score": 85,
  "feedback": "Good understanding of React basics"
}
```

**Expected Response:**
```json
{
  "message": "Interview created successfully",
  "interview": {
    "id": 1,
    "candidate_id": 1,
    "question_id": 1,
    "score": 85,
    "feedback": "Good understanding of React basics",
    "created_at": "2026-03-02T10:40:00"
  }
}
```

### Step 12: Get All Interviews
```
GET http://127.0.0.1:5000/api/interviews
```

### Step 13: Get Candidate Interviews
```
GET http://127.0.0.1:5000/api/interviews/candidate/1
```

### Step 14: Update Interview
```
PUT http://127.0.0.1:5000/api/interviews/1

Headers:
- Content-Type: application/json
- Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

Body (JSON):
{
  "score": 90,
  "feedback": "Excellent understanding of React. Great job!"
}
```

### Step 15: Delete Interview
```
DELETE http://127.0.0.1:5000/api/interviews/1

Headers:
- Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## 🌐 Frontend Testing (Browser)

### Step 16: Register via Frontend
1. Open http://localhost:3000
2. Click Register
3. Enter:
   - Username: `frontendusertest`
   - Email: `frontendtest@example.com`
   - Password: `FrontendTest123`
4. Submit

### Step 17: Login via Frontend
1. Fill in username and password
2. Click Login
3. Should redirect to dashboard

### Step 18: Test Candidate Features
1. Navigate to Candidates section
2. View candidate list (should see Alice Johnson)
3. Click "Add Candidate"
4. Create new candidate via form
5. Edit candidate details
6. Delete candidate (optional)

### Step 19: Test Question Features
1. Navigate to Questions section
2. View all questions
3. Filter by difficulty level
4. Create new question
5. Edit/delete (if admin)

### Step 20: Test Interview Features
1. Navigate to Interviews section
2. View interviews
3. Create new interview
4. Edit interview score/feedback
5. Delete interview (optional)

---

## ✅ Validation Checklist

After completing all tests, verify:

- [ ] User registration works without errors
- [ ] Login returns valid JWT token
- [ ] Token persists in localStorage
- [ ] Can create candidates
- [ ] Can view candidates list
- [ ] Can update candidate details
- [ ] Can search candidates
- [ ] Can create questions
- [ ] Can filter questions by difficulty
- [ ] Can create interviews
- [ ] Can update interview score
- [ ] All operations reflected in database
- [ ] Frontend displays data correctly
- [ ] No CORS errors in browser console
- [ ] Protected endpoints reject requests without token

---

## 🐛 If Something Goes Wrong

### Error: "Cannot connect to backend"
- Check Flask server is running
- Verify API_BASE_URL in frontend
- Check firewall settings

### Error: "Invalid token"
- Token may have expired (24 hour limit)
- Re-login to get new token
- Clear localStorage and try again

### Error: "Candidate not found"
- Verify candidate ID exists
- Check if candidate was created in current session
- Try getting all candidates first

### Error: "CORS error"
- Backend already has CORS configured
- Check browser console for exact error
- Verify frontend URL is http://localhost:3000

---

## 🎯 Test Data Summary

After all tests, your database should have:

**Users:**
- testuser123 (registered via API)
- frontendusertest (registered via frontend)

**Candidates:**
- Alice Johnson (created via API, updated)

**Questions:**
- What is React? (difficulty: easy)
- Explain async/await (difficulty: medium)
- Design a system (difficulty: hard)

**Interviews:**
- Interview for Alice with Question 1 (score: 90)

---

## 📊 Expected Data Flow

```
1. User registers → Data stored in users table
2. User login → JWT token generated
3. Create candidate → Data stored in candidates table
4. Create question → Data stored in questions table
5. Create interview → Links candidate & question
6. Update interview → Score/feedback updated
7. Get data → Frontend displays from database
```

---

Happy testing! 🎉
