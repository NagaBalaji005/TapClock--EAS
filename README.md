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

**TapClock (EAS)** is a full-stack attendance system designed for employees and managers.

### Roles:

- **Employee:** login, mark attendance, view history, dashboard, profile.
- **Manager:** manage team attendance, filters, reports, team dashboard, export CSV.

---

## Features

### Employee Features

- Register / Login (JWT Auth)
- Check In / Check Out
- Automatic status detection (Present / Late / Half-Day / Absent)
- Calendar & Table attendance views
- Monthly summary
- Profile management

### Manager Features

- View all employees' attendance
- Filter by employee, department, date, status
- Team calendar view
- Export attendance data (CSV)
- Dashboard: trends, late arrivals, absent employees

---

## Tech Stack

- **Frontend:** React, Redux Toolkit, React Router, Axios, date-fns
- **Backend:** Node.js, Express, bcryptjs, jsonwebtoken, express-validator
- **Database:** PostgreSQL (pg)
- **Tools:** Nodemon, dotenv

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

---

## Database Schema

### `users` Table

```sql
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role VARCHAR(20) NOT NULL,     -- employee/manager
employee_id VARCHAR(50) UNIQUE,
department VARCHAR(100),
date_of_joining DATE,
contact_number VARCHAR(20),
address TEXT,
work_location VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### `attendance` Table

```sql
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
date DATE NOT NULL,
check_in_time TIMESTAMP,
check_out_time TIMESTAMP,
status VARCHAR(20),            -- present/late/absent/half-day
total_hours DECIMAL(5,2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE (user_id, date)
```

---

## Environment Variables

### Backend `.env`

```env
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
```

### Frontend `.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Setup & Run (Local)

### 1. Clone Repository

```bash
git clone <repository-url>
cd tapacademy
```

### 2. Create Database

```sql
CREATE DATABASE attendance_system;
```

### 3. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs at: `http://localhost:5000`

### 4. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## Seed Data (Optional)

```bash
cd backend
npm run seed
```

**Default accounts:**

**Manager:**
- `manager@example.com` / `password123`

**Employee:**
- `alice@example.com` / `password123`

---

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

### Attendance (Employee)

- `POST /api/attendance/checkin`
- `POST /api/attendance/checkout`
- `GET /api/attendance/today`
- `GET /api/attendance/my-history`
- `GET /api/attendance/my-summary`

### Attendance (Manager)

- `GET /api/attendance/all`
- `GET /api/attendance/employee/:id`
- `GET /api/attendance/summary`
- `GET /api/attendance/export`
- `GET /api/attendance/today-status`
- `POST /api/attendance/mark-absent`
- `POST /api/attendance/auto-mark-absent`

### Dashboard

- `GET /api/dashboard/employee`
- `GET /api/dashboard/manager`

---

## Usage Notes

- **Work Hours:** 10 AM – 6 PM
- **On-time:** before 10 AM
- **Late:** after 10 AM
- **Absent:** no check-in by 12 PM
- **Half-day:** checkout before 2 PM
- **Total hours** auto-calculated

---

## Troubleshooting

- Recheck PostgreSQL credentials
- If password has spaces → use `%20`
- Fix CORS by updating backend `.env`
- Port conflict → change port in `.env`

---

## Contributing

1. Fork repo
2. Create branch
3. Commit changes
4. Open PR

---

## License

This project is released under the MIT License.

---

## 📽️ Project Explanation Video

👉 [Watch Video](https://drive.google.com/file/d/1gUYCdNEhfcYAccxkaHYCnL8jxyyW_7vv/view?usp=drivesdk)

---

## Contact

**Adapala Naga Balaji**  
Vignan's Lara Institute of Technology and Science

📞 +91 93943 14214  
✉️ adapala.nagabalaji005@gmail.com

