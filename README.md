# Student Trust Score Management System

A full-stack school management application for tracking student trust score, academic performance, participation, and rewards in a structured and transparent way.

## Overview

The Student Trust Score Management System helps faculty manage student performance using a composite trust score. The platform allows teachers to:

- manage students class-wise and section-wise
- record academic and activity metrics
- calculate a trust score automatically
- review student performance through dashboard summaries
- identify students who need attention
- track reward-based bonus achievements separately from the core formula

This project is designed for school use, where both academic and non-academic performance matter.

## Core Features

- Faculty login and protected dashboard
- Student registration and login
- Class and section based student filtering
- Student management for faculty
- Metrics entry for:
  - attendance
  - exam average
  - assignment completion
  - sports participation
  - extra-curricular participation
  - rewards bonus
- Trust score reporting table
- Dashboard overview with class-level averages
- Needs-attention view for lower scoring students

## Trust Score Model

The base trust score is calculated using five equal components:

```text
Attendance         = 20%
Exam Average       = 20%
Assignments        = 20%
Sports             = 20%
Extra-Curricular   = 20%
```

### Formula

```text
Base Trust Score
= 0.20 × Attendance
+ 0.20 × Exam Average
+ 0.20 × Assignment Score
+ 0.20 × Sports Score
+ 0.20 × Extra-Curricular Score
```

## Rewards Bonus

Rewards are stored as a separate add-on and are not part of the 100% base trust formula.

Recommended reward bonus logic used in the project:

- 1st prize: `+5%`
- 2nd prize: `+3%`
- 3rd prize: `+2%`
- maximum rewards bonus: `+10%`

### Final Score

```text
Final Trust Score = Base Trust Score + Rewards Bonus
```

The final score is capped at `100`.

## Dashboard Metrics

The faculty dashboard overview currently displays:

- total students
- class average final trust score
- class average attendance
- class average exam score
- class average assignment score
- class average sports score
- class average extra-curricular score
- average rewards bonus
- top performer
- needs attention list

## Tech Stack

### Frontend

- React
- Vite
- Axios
- React Router

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication

## Project Structure

```text
student/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── styles/
│   └── vite.config.js
└── README.md
```

## Local Setup

### Prerequisites

- Node.js installed
- MongoDB installed and running locally, or MongoDB Atlas connection
- Git

## Environment Variables

### Backend `.env`

```env
MONGO_URI=mongodb://127.0.0.1:27017/trustscoreDB
JWT_SECRET=your-secret-key
```

### Frontend `.env.local`

```env
VITE_API_BASE_URL=http://localhost:5001
```

## Run Locally

### 1. Start the backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:5001
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

## API Areas

### User Routes

- register user
- login user
- get students by class and section
- delete student

### Metrics Routes

- add metrics
- get all metrics
- get metrics by student
- delete metric

## Current Workflow

1. Faculty logs in
2. Faculty selects class and section
3. Faculty manages student list
4. Faculty enters metrics for each student
5. System calculates base score and rewards bonus
6. Dashboard and reports reflect the updated score

## Highlights

- simple faculty-first workflow
- transparent trust score structure
- bonus-based reward system
- expandable metrics model for future school requirements
- clean dashboard summary for class-level analysis

## Future Enhancements

- admin dashboard
- downloadable reports
- charts and analytics
- student-side score breakdown
- notification system
- separate reward history tracking

## Author

**Padma Vishnu Priya**

