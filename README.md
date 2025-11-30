# TapClock — EAS

**Employee Tracking System**

**Name:** Adapala Naga Balaji  
**College:** Vignan's Lara Institute of Technology and Science  
**Contact:** +91 93943 14214  
**Email:** adapala.nagabalaji005@gmail.com

> Lightweight, role-based attendance tracking system for employees and managers — built with **React**, **Redux Toolkit**, **Node.js**, **Express**, and **PostgreSQL**.

---

## 🔍 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Setup & Run (Local)](#setup--run-local)
- [Seed Data](#seed-data)
- [API Endpoints](#api-endpoints)
- [Usage Notes](#usage-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [📽️ Project Explanation Video](#📽️-project-explanation-video)
- [Contact](#contact)

---

## Project Overview
TapClock (EAS) is a complete employee & manager attendance system supporting check-in/out, history, calendar, analytics, and reporting.

---

## Features

### Employee
- Register/Login (JWT)
- Check-In & Check-Out
- Calendar + Table history
- Monthly summary
- Profile management

### Manager
- View all employee attendance
- Filters: date, department, employee, status
- Team calendar
- Export CSV
- Dashboard: stats, late arrivals, absent list

---

## Tech Stack

- **Frontend:** React, Redux Toolkit, React Router, Axios  
- **Backend:** Node.js, Express, bcryptjs, jsonwebtoken  
- **DB:** PostgreSQL  
- **Tools:** Nodemon, dotenv  

---

## 📁 Project Structure

```plaintext
tapacademy/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── attendance.js
│   │   └── dashboard.js
│   ├── scripts/
│   │   └── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── App.js
│   ├── package.json
│   └── .env.example
└── README.md
✔ Now the project structure will ALWAYS show vertically.

Database Schema
Users Table
sql
Copy code
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role VARCHAR(20) NOT NULL,
employee_id VARCHAR(50) UNIQUE,
department VARCHAR(100),
date_of_joining DATE,
contact_number VARCHAR(20),
address TEXT,
work_location VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
Attendance Table
sql
Copy code
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
date DATE NOT NULL,
check_in_time TIMESTAMP,
check_out_time TIMESTAMP,
status VARCHAR(20),
total_hours DECIMAL(5,2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE (user_id, date)
Environment Variables
Backend .env
env
Copy code
PORT=5000
NODE_ENV=development

DATABASE_URL=postgres://postgres:password@localhost:5432/attendance_system

DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendance_system
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=replace_with_a_strong_random_string
CORS_ORIGIN=http://localhost:3000
Frontend .env
env
Copy code
REACT_APP_API_URL=http://localhost:5000/api
Setup & Run (Local)
1. Clone Repo
bash
Copy code
git clone <repository-url>
cd tapacademy
2. Create DB
sql
Copy code
CREATE DATABASE attendance_system;
3. Backend
bash
Copy code
cd backend
npm install
npm run dev
4. Frontend
bash
Copy code
cd ../frontend
npm install
npm start
Seed Data (Optional)
bash
Copy code
cd backend
npm run seed
API Endpoints
Auth
POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

PUT /api/auth/profile

Employee Attendance
POST /api/attendance/checkin

POST /api/attendance/checkout

GET /api/attendance/today

GET /api/attendance/my-history

GET /api/attendance/my-summary

Manager Attendance
GET /api/attendance/all

GET /api/attendance/employee/:id

GET /api/attendance/summary

GET /api/attendance/export

GET /api/attendance/today-status

POST /api/attendance/mark-absent

POST /api/attendance/auto-mark-absent

Dashboard
GET /api/dashboard/employee

GET /api/dashboard/manager

Usage Notes
Work hours: 10 AM – 6 PM

On-time: before 10 AM

Absent: no check-in by 12 PM

Half-day: checkout before 2 PM

Troubleshooting
Postgres not connecting → check .env

Password has spaces → use %20

CORS error → update backend .env

Port conflicts → change port

Contributing
Fork

Create a branch

Commit

Open PR

License
This project is licensed under the MIT License.

📽️ Project Explanation Video
👉 https://drive.google.com/file/d/1gUYCdNEhfcYAccxkaHYCnL8jxyyW_7vv/view?usp=drivesdk

Contact
Adapala Naga Balaji
Vignan's Lara Institute of Technology and Science
📞 +91 93943 14214
✉️ adapala.nagabalaji005@gmail.com

markdown
Copy code
