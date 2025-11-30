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
- [Contact](#contact)

---

## Project Overview

**TapClock (EAS)** is a full-stack attendance solution with two roles:

- **Employee** — register/login, check-in/check-out, view history, monthly summary, dashboard.  
- **Manager** — view and manage team attendance, filters, calendar, CSV exports, team dashboard.

Designed for small-to-medium companies and training academies (e.g., TAP Academy).

---

## Features

### Employee
- Register / Login (JWT)
- Check In / Check Out (automatic status: present / late / half-day / absent)
- Calendar & Table attendance views
- Monthly summary & recent activity
- Profile management

### Manager
- View all employees' attendance
- Filter by employee / department / status / date range
- Team calendar & team summary
- Export reports (CSV)
- Manager dashboard (trends, late arrivals, absent list)

---

## Tech Stack

- **Frontend:** React, Redux Toolkit, React Router, Axios, date-fns  
- **Backend:** Node.js, Express, jsonwebtoken, bcryptjs, express-validator  
- **Database:** PostgreSQL (`pg`)  
- **Dev Tools:** Nodemon, dotenv

---

## 📁 Project Structure

```
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
```


## Database Schema

### `users`
```sql
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,  -- hashed
role VARCHAR(20) NOT NULL,       -- 'employee' or 'manager'
employee_id VARCHAR(50) UNIQUE,
department VARCHAR(100),
date_of_joining DATE,
contact_number VARCHAR(20),
address TEXT,
work_location VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
attendance
sql
Copy code
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
date DATE NOT NULL,
check_in_time TIMESTAMP,
check_out_time TIMESTAMP,
status VARCHAR(20),              -- 'present','late','absent','half-day'
total_hours DECIMAL(5,2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE (user_id, date)
Recommended indexes

idx_attendance_user_id on attendance(user_id)

idx_attendance_date on attendance(date)

idx_users_email on users(email)

idx_users_employee_id on users(employee_id)

Environment Variables
Copy .env.example → .env in both backend/ and frontend/ and fill values.

backend/.env.example
env
Copy code
PORT=5000
NODE_ENV=development

# DATABASE_URL (recommended)
DATABASE_URL=postgres://postgres:password@localhost:5432/attendance_system

# OR individual DB parameters
DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendance_system
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=replace_with_a_strong_random_string
CORS_ORIGIN=http://localhost:3000
frontend/.env.example
env
Copy code
REACT_APP_API_URL=http://localhost:5000/api
Security: Never commit .env with secrets. Commit only .env.example.

Setup & Run (Local)
1. Clone
bash
Copy code
git clone <repository-url>
cd tapacademy
2. Create Database
Open pgAdmin or psql and run:

sql
Copy code
CREATE DATABASE attendance_system;
3. Backend
bash
Copy code
cd backend
npm install
# create backend/.env from .env.example and update values
npm run dev
Server default: http://localhost:5000

4. Frontend
bash
Copy code
cd ../frontend
npm install
# create frontend/.env from .env.example
npm start
App default: http://localhost:3000

Seed Data (Optional)
If included, run the seed script to create sample users and attendance:

bash
Copy code
cd backend
npm run seed
Default sample credentials (local testing)

Manager: manager@example.com / password123

Employee: alice@example.com / password123

Replace these before production.

API Endpoints (summary)
Auth
POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

PUT /api/auth/profile

Attendance (Employee)
POST /api/attendance/checkin

POST /api/attendance/checkout

GET /api/attendance/today

GET /api/attendance/my-history?month=&year=

GET /api/attendance/my-summary?month=&year=

Attendance (Manager)
GET /api/attendance/all?startDate=&endDate=&department=&status=&search=

GET /api/attendance/employee/:id

GET /api/attendance/summary?month=&year=

GET /api/attendance/export?startDate=&endDate=

GET /api/attendance/today-status

POST /api/attendance/mark-absent

POST /api/attendance/auto-mark-absent

Dashboard
GET /api/dashboard/employee

GET /api/dashboard/manager?department=

Use JWT: Authorization: Bearer <token> for protected routes.

Usage Notes & Attendance Rules
Work Hours: 10:00 AM — 6:00 PM

On-time: check-in before 10:00 → present

Late: check-in after 10:00 → late

Absent: no check-in by 12:00 PM → absent (can be auto-marked via cron)

Half-day: check-out before 2:00 PM

Total hours: calculated from check-in → check-out

Troubleshooting
DB connection: verify .env credentials and that PostgreSQL is running.

Password with spaces: avoid spaces or URL-encode them in DATABASE_URL (%20).

Port conflict: change PORT in backend/.env.

CORS errors: ensure CORS_ORIGIN matches frontend URL.

Contributing
Fork the repository

Create a branch: feature/your-feature

Commit & push

Open a Pull Request

Please follow code style and add tests where applicable.

License
This project is released under the MIT License — see the LICENSE file for details.

Contact
Adapala Naga Balaji
Vignan's Lara Institute of Technology and Science
📞 +91 93943 14214
✉️ adapala.nagabalaji005@gmail.com
