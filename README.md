# Interview Management Platform

<p align="center">

<img src="https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>

<img src="https://img.shields.io/badge/Backend-Flask-3BABC3?style=for-the-badge&logo=flask&logoColor=white"/>

<img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>

<img src="https://img.shields.io/badge/Authentication-JWT-FF6B35?style=for-the-badge"/>

<img src="https://img.shields.io/badge/ORM-SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white"/>

</p>

## Overview

A full-stack Interview Management Platform designed to streamline candidate evaluation workflows through a centralized web application.

The system provides secure authentication, candidate management, interview question administration, and interview result tracking through a REST API-driven architecture where all frontend content is dynamically rendered from backend services.

---

## Architecture

```text
┌─────────────────────┐
│      Next.js        │
│      Frontend       │
└──────────┬──────────┘
           │ REST APIs
           ▼
┌─────────────────────┐
│       Flask         │
│      Backend        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       MySQL         │
│      Database       │
└─────────────────────┘
```

---

## Core Features

### Authentication & Security

* User Registration
* Secure Login
* JWT Authentication
* Protected Routes
* Password Hashing

### Candidate Management

* Candidate Profile Creation
* Candidate Tracking
* Candidate Status Management

### Interview Administration

* Interview Question Repository
* Difficulty Classification
* Interview Scheduling Support

### Evaluation Workflow

* Interview Result Tracking
* Score Management
* Feedback Recording

### Dynamic Frontend Rendering

* No hardcoded datasets
* Backend-driven UI rendering
* REST API integration across all pages

---

## Technology Stack

| Layer             | Technology    |
| ----------------- | ------------- |
| Frontend          | Next.js       |
| Backend           | Flask         |
| Database          | MySQL         |
| ORM               | SQLAlchemy    |
| Authentication    | JWT           |
| API Communication | REST APIs     |
| Client Requests   | Axios / Fetch |

---

## Repository Structure

```text
InterviewApp/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud.py
│   └── requirements.txt
│
├── src/
│   ├── app/
│   ├── pages/
│   ├── components/
│   └── services/
│
└── README.md
```

---

## Authentication Flow

```text
User Login
     │
     ▼
Flask Authentication Service
     │
     ▼
Password Verification
     │
     ▼
JWT Token Generation
     │
     ▼
Frontend Stores Token
     │
     ▼
Protected API Access
```

---

## Development Setup

### Backend

```bash
python -m venv venv
pip install -r requirements.txt
```

Run:

```bash
python main.py
```

### Frontend

```bash
npm install
npm run dev
```

---

## API Testing

The APIs can be tested using:

* Postman
* Thunder Client
* Browser Developer Tools

---

## Engineering Highlights

* Backend-led architecture with dynamic API-driven rendering
* JWT-based authentication and authorization
* SQLAlchemy-based database abstraction
* Modular separation of frontend and backend concerns
* Relational database design for candidate and interview workflows

---

## Future Enhancements

* Role-Based Access Control (RBAC)
* Interview Analytics Dashboard
* Search and Filtering
* Pagination
* Docker Deployment
* CI/CD Integration
* Automated Testing
* Monitoring and Logging

---

## License

This project was developed for learning, portfolio, and engineering demonstration purposes.

---

# Author

Built as a full-stack dynamic Interview Management System.
