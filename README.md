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
tapacademy/
├── backend/
│ ├── config/
│ │ └── database.js
│ ├── middleware/
│ │ └── auth.js
│ ├── routes/
│ │ ├── auth.js
│ │ ├── attendance.js
│ │ └── dashboard.js
│ ├── scripts/
│ │ └── seed.js
│ ├── server.js
│ ├── package.json
│ └── .env.example
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── store/
│ │ └── App.js
│ ├── package.json
│ └── .env.example
└── README.md

---

## Database Schema
### `users` table

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

---

### `attendance` table

```sql
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
date DATE NOT NULL,
check_in_time TIMESTAMP,
check_out_time TIMESTAMP,
status VARCHAR(20),              -- 'present','late','absent','half-day'
total_hours DECIMAL(5,2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE (user_id, date)

---

## Recommended Indexes

-idx_attendance_user_id on attendance(user_id)

-idx_attendance_date on attendance(date)

-idx_users_email on users(email)

-idx_users_employee_id on users(employee_id)

---

## Environment Variables

Copy .env.example → .env in both backend/ and frontend/ and fill values.

backend/.env.example
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

frontend/.env.example
REACT_APP_API_URL=http://localhost:5000/api

---

