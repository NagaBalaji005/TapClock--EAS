# TAP CLOCK - Employee Attendance System

A comprehensive full-stack attendance tracking system with role-based access control for employees and managers. Built with React, Redux Toolkit, Node.js, Express, and PostgreSQL.

## 🎯 Features

### Employee Features
- **Authentication**: Register and login with email/password
- **Mark Attendance**: 
  - Check In / Check Out
  - Automatic status detection (Present/Late based on 10 AM cutoff)
  - Full-day/Half-day determination (based on 2 PM checkout time)
- **Attendance History**: 
  - Calendar view with color-coded dates
  - Table view with detailed records
  - Month selection for viewing past records
- **Dashboard**: 
  - Today's attendance status
  - Monthly summary (Present/Absent/Late/Half-day counts)
  - Total hours worked
  - Recent attendance (last 7 days)
  - Quick actions (Mark Attendance, View History)
- **Profile Management**: 
  - View and edit profile information
  - Fields: Name, Employee ID, Email, Role, Department, Date of Joining, Contact Number, Address, Work Location

### Manager Features
- **All Employee Features**: Managers can also mark their own attendance and view their history
- **Team Management**:
  - View all employees' attendance records
  - Filter by employee (search by name/ID/email), department, date range, and status
  - Team calendar view with aggregated statistics
- **Dashboard**: 
  - Total employees count
  - Today's attendance (Present/Absent/Late)
  - Late arrivals list
  - Absent employees list
  - Department-wise attendance breakdown
  - Weekly attendance trend (last 7 days)
  - Quick actions (Mark Attendance, View History)
- **Reports**:
  - Generate attendance reports with advanced filters
  - Export to CSV with date-stamped filenames
  - Filter by employee, department, date range, and status
- **Team Calendar**: 
  - Visual calendar view with daily statistics
  - Shows Present, Absent, Late, Half-day counts
  - Displays total hours and attendance percentage per day
  - Color-coded for easy identification

## 🛠 Tech Stack

- **Frontend**: 
  - React 18.2.0
  - Redux Toolkit 2.0.1
  - React Router DOM 6.20.0
  - Axios 1.6.2
  - date-fns 2.30.0
- **Backend**: 
  - Node.js
  - Express 4.18.2
  - PostgreSQL (pg 8.11.3)
  - JWT Authentication (jsonwebtoken 9.0.2)
  - Bcrypt for password hashing (bcryptjs 2.4.3)
  - Express Validator 7.0.1
- **Database**: PostgreSQL 12+

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tapacademy
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE attendance_system;
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
# Option 1: Use DATABASE_URL (recommended for production)
DATABASE_URL=postgresql://postgres:password@localhost:5432/attendance_system

# Option 2: Use individual parameters (for development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendance_system
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Secret (change this to a secure random string)
JWT_SECRET=your_jwt_secret_key_here_change_this_to_a_secure_random_string

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎬 How to Run

### 1. Start PostgreSQL

Make sure PostgreSQL is running on your system.

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Start Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

### 4. Seed the Database (Optional)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

This will create:
- 1 manager account: `manager@example.com` / `password123`
- 5 employee accounts: `alice@example.com`, `bob@example.com`, etc. / `password123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  - Body: `{ name, email, password, role, department }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)
  - Body: `{ name?, department?, dateOfJoining?, contactNumber?, address?, workLocation? }`

### Attendance (Employee - Protected)
- `POST /api/attendance/checkin` - Check in (marks as present/late automatically)
- `POST /api/attendance/checkout` - Check out (determines full-day/half-day)
- `GET /api/attendance/today` - Get today's attendance status
- `GET /api/attendance/my-history?month=&year=` - Get my attendance history
- `GET /api/attendance/my-summary?month=&year=` - Get monthly summary

### Attendance (Manager Only - Protected)
- `GET /api/attendance/all?startDate=&endDate=&department=&status=&search=` - Get all employees attendance
- `GET /api/attendance/employee/:id` - Get specific employee attendance
- `GET /api/attendance/summary?month=&year=` - Get team summary
- `GET /api/attendance/export?startDate=&endDate=&department=&status=&search=` - Export CSV
- `GET /api/attendance/today-status` - Get today's status for all employees
- `POST /api/attendance/mark-absent` - Manually mark absent employees (after 12 PM)
- `POST /api/attendance/auto-mark-absent` - Auto-mark absent (can be called by cron job after 12 PM)

### Dashboard
- `GET /api/dashboard/employee` - Employee dashboard stats (Protected)
- `GET /api/dashboard/manager?department=` - Manager dashboard stats (Manager Only)

## 📊 Database Schema

### Users Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255) NOT NULL)
- email (VARCHAR(255) UNIQUE NOT NULL)
- password (VARCHAR(255) NOT NULL)
- role (VARCHAR(20) CHECK: 'employee' or 'manager')
- employee_id (VARCHAR(50) UNIQUE NOT NULL)
- department (VARCHAR(100))
- date_of_joining (DATE)
- contact_number (VARCHAR(20))
- address (TEXT)
- work_location (VARCHAR(255))
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
```

### Attendance Table
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FOREIGN KEY -> users.id)
- date (DATE NOT NULL)
- check_in_time (TIMESTAMP)
- check_out_time (TIMESTAMP)
- status (VARCHAR(20) CHECK: 'present', 'absent', 'late', 'half-day')
- total_hours (DECIMAL(5,2))
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- UNIQUE(user_id, date)
```

**Indexes:**
- `idx_attendance_user_id` on `attendance(user_id)`
- `idx_attendance_date` on `attendance(date)`
- `idx_users_email` on `users(email)`
- `idx_users_employee_id` on `users(employee_id)`

## 📁 Project Structure

```
tapacademy/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection and initialization
│   ├── middleware/
│   │   └── auth.js              # JWT authentication and role-based access
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── attendance.js        # Attendance routes
│   │   └── dashboard.js         # Dashboard routes
│   ├── scripts/
│   │   ├── seed.js             
│   │   └── test-dasboard.js         
│   ├── server.js                # Express server setup
│   ├── package.json
│   └── .env                     # Environment variables (create from example)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navigation bar
│   │   │   └── PrivateRoute.js  # Route protection
│   │   ├── config/
│   │   │   └── api.js           # Centralized API URL configuration
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── EmployeeDashboard.js
│   │   │   ├── ManagerDashboard.js
│   │   │   ├── MarkAttendance.js
│   │   │   ├── MyAttendanceHistory.js
│   │   │   ├── Profile.js
│   │   │   ├── AllEmployeesAttendance.js
│   │   │   ├── TeamCalendar.js
│   │   │   └── Reports.js
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js      # Authentication state
│   │   │   │   └── attendanceSlice.js # Attendance state
│   │   │   └── store.js              # Redux store configuration
│   │   ├── utils/
│   │   │   └── apiHelpers.js    # Reusable API helper functions
│   │   ├── App.js               # Main app component with routing
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   └── .env                     # Environment variables (create from example)
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens (required)
- `DATABASE_URL` - PostgreSQL connection string (optional, can use individual params)
- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name (default: attendance_system)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (required)
- `CORS_ORIGIN` - CORS allowed origin (default: http://localhost:3000)

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## ⏰ Attendance Rules

### Check-In Logic
- **Work Hours**: 10:00 AM - 6:00 PM
- **On-Time**: Check-in before 10:00 AM → Status: `present`
- **Late**: Check-in after 10:00 AM → Status: `late` (still counts as present)
- **Absent**: No check-in by 12:00 PM (noon) → Status: `absent` (automatically marked)

### Check-Out Logic
- **Full Day**: Check-out after 2:00 PM → Full attendance
- **Half Day**: Check-out before 2:00 PM → Half-day attendance
- **Total Hours**: Automatically calculated based on check-in and check-out times

### Status Types
- `present` - Checked in on time
- `late` - Checked in after 10 AM (still counts as present)
- `absent` - No check-in by 12 PM
- `half-day` - Checked out before 2 PM

## 🎨 UI Features

### Calendar Views
- **Employee Calendar**: Color-coded dates showing individual attendance status
  - 🟢 Green: Present
  - 🔴 Red: Absent
  - 🟡 Yellow: Late
  - 🟠 Orange: Half-day
- **Team Calendar**: Color-coded dates showing team statistics
  - 🟢 Green: All present
  - 🟡 Yellow: Mixed attendance
  - 🔴 Red: Has absentees
  - Each date box shows: Present count, Absent count, Late count, Half-day count, Total hours, Attendance percentage

### Dashboard Statistics
- **Employee Dashboard**: Today's status, monthly summary, total hours, recent attendance
- **Manager Dashboard**: Team overview, department breakdown, weekly trends, late arrivals, absent employees

### CSV Export
- Filenames include date range: `attendance_20251101_to_20251130.csv`
- Includes all filtered data: Employee ID, Name, Email, Department, Date, Check In, Check Out, Status, Total Hours

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with role-based access control
- Input validation with express-validator
- SQL injection prevention with parameterized queries
- CORS configuration

## 📝 Default Credentials

After running the seed script:

**Manager:**
- Email: `manager@example.com`
- Password: `password123`

**Employees:**
- Email: `alice@example.com`, `bob@example.com`, etc.
- Password: `password123`

## 🚀 Deployment Notes

### Production Checklist
1. Set `NODE_ENV=production` in backend `.env`
2. Use a strong `JWT_SECRET` (32+ characters, random)
3. Configure `DATABASE_URL` with production PostgreSQL credentials
4. Enable SSL for database connection in `database.js`
5. Update `CORS_ORIGIN` to production frontend URL
6. Build frontend: `cd frontend && npm run build`
7. Serve frontend build with a static file server (nginx, etc.)
8. Set up cron job for auto-marking absent employees at 12 PM daily:
   ```bash
   0 12 * * * curl -X POST http://your-api-url/api/attendance/auto-mark-absent
   ```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE attendance_system;`
- For URL-encoded passwords, use `%20` for spaces in `DATABASE_URL`

### Port Already in Use
- Backend: Change `PORT` in backend `.env`
- Frontend: React will prompt to use a different port automatically

### CORS Errors
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check browser console for specific CORS error details

## 📚 Technologies Used

- **Frontend**: React, Redux Toolkit, React Router, Axios, date-fns
- **Backend**: Node.js, Express, PostgreSQL, JWT, Bcrypt
- **Development**: Nodemon, React Scripts

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for efficient attendance management**
