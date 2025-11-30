# TapClock — EAS

A modern and efficient **Employee Attendance System** built for companies and training academies. It provides role-based access for employees and managers, real-time attendance tracking, team analytics, and clean UI dashboards.

---

## 👤 Author  
**Name:** Adapala Naga Balaji  
**College:** Vignan's Lara Institute of Technology and Science  
**Contact:** +91 93943 14214  
**Email:** adapala.nagabalaji005@gmail.com  

---

## 🌟 Features

### 🧑‍💼 Employee Features
- Register / Login (JWT Authentication)
- Check In / Check Out
- Automatic status detection (Present / Late / Half-Day / Absent)
- Calendar & Table Attendance View
- Monthly Summary & Stats
- Profile Management
- Recent Attendance History

### 👨‍💼 Manager Features
- View All Employees' Attendance
- Advanced Filters (date range, employee, department, status)
- Team Calendar View
- Export Attendance (CSV)
- Manager Dashboard (Late arrivals, Absentees, Trends)
- Department-wise Statistics

---

## 🧰 Tech Stack

### Frontend
- React  
- Redux Toolkit  
- React Router  
- Axios  
- date-fns  

### Backend
- Node.js  
- Express  
- PostgreSQL  
- bcryptjs  
- jsonwebtoken  
- express-validator  

### Tools
- Nodemon  
- dotenv  

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
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── store/
│ │ └── App.js
│ ├── package.json
│ └── .env.example
│
└── README.md

pgsql
Copy code

---

## 🗄️ Database Schema

### `users` Table
```sql
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
attendance Table
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
🔧 Environment Variables
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
🚀 Getting Started
1. Clone the Repository
bash
Copy code
git clone <repository-url>
cd tapacademy
2. Create the Database
sql
Copy code
CREATE DATABASE attendance_system;
3. Backend Setup
bash
Copy code
cd backend
npm install
npm run dev
4. Frontend Setup
bash
Copy code
cd ../frontend
npm install
npm start
Backend runs at: http://localhost:5000

Frontend runs at: http://localhost:3000

🌱 Seed Data (Optional)
bash
Copy code
cd backend
npm run seed
Default Accounts
Manager:

Email: manager@example.com

Password: password123

Employee:

Email: alice@example.com

Password: password123

📡 API Endpoints
🔐 Auth
POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

PUT /api/auth/profile

👤 Employee Attendance
POST /api/attendance/checkin

POST /api/attendance/checkout

GET /api/attendance/today

GET /api/attendance/my-history

GET /api/attendance/my-summary

👨‍💼 Manager Attendance
GET /api/attendance/all

GET /api/attendance/employee/:id

GET /api/attendance/summary

GET /api/attendance/export

GET /api/attendance/today-status

POST /api/attendance/mark-absent

POST /api/attendance/auto-mark-absent

📊 Dashboard
GET /api/dashboard/employee

GET /api/dashboard/manager

📘 Usage Notes
Work Hours: 10 AM – 6 PM

On-time: before 10 AM

Late: after 10 AM

Absent: no check-in by 12 PM

Half-day: checkout before 2 PM

Total hours auto-calculated

🐞 Troubleshooting
Check .env values if DB connection fails

Password with spaces → encode using %20

CORS issues → update backend .env

Port conflicts → change PORT

🤝 Contributing
Fork the repository

Create a feature branch

Commit changes

Push

Submit PR

📄 License
This project is licensed under the MIT License.

📽️ Project Explanation Video
👉 https://drive.google.com/file/d/1gUYCdNEhfcYAccxkaHYCnL8jxyyW_7vv/view?usp=drivesdk

📬 Contact
Adapala Naga Balaji
Vignan's Lara Institute of Technology and Science
📞 +91 93943 14214
✉️ adapala.nagabalaji005@gmail.com
